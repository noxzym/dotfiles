import Pango from "gi://Pango";
import Notifd from "gi://AstalNotifd";
import GLib from "gi://GLib";
import { Gtk } from "ags/gtk4";

const notifd = Notifd.get_default();
const DEFAULT_TIMEOUT = 5000;

function getTimeout(notification: Notifd.Notification) {
	return notification.expireTimeout > 0 ? notification.expireTimeout : DEFAULT_TIMEOUT;
}

function setWindowVisible(widget: Gtk.Widget, visible: boolean) {
	widget.set_visible(visible);

	const root = widget.get_root();

	if (root instanceof Gtk.Window) {
		root.set_visible(visible);

		if (!visible) root.hide();
	}

	if (!visible) widget.hide();
}

function stripMarkup(text: string) {
	return text
		.replace(/<a\s+[^>]*href=["'][^"']*["'][^>]*>(.*?)<\/a>/gi, "$1")
		.replace(/<[^>]+>/g, "")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

function truncateText(text: string, maxLength: number) {
	return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

function getIconName(notification: Notifd.Notification) {
	return notification.appIcon || notification.desktopEntry || "dialog-information-symbolic";
}

function makeIcon(notification: Notifd.Notification) {
	const imagePath = notification.image;
	const icon = imagePath
		? Gtk.Image.new_from_file(imagePath)
		: new Gtk.Image({ iconName: getIconName(notification) });

	icon.pixelSize = 16;
	icon.valign = Gtk.Align.CENTER;
	icon.add_css_class("notification-icon");

	return icon;
}

function activateNotification(notification: Notifd.Notification, onClose: () => void) {
	const defaultAction = notification.actions.find((action) => action.id === "default");

	if (!defaultAction) return;

	notification.invoke(defaultAction.id);
	onClose();
}

function makeNotification(notification: Notifd.Notification, onClose: () => void) {
	const root = new Gtk.Box({
		orientation: Gtk.Orientation.VERTICAL,
		spacing: 8,
	});

	const click = new Gtk.GestureClick();
	click.connect("released", () => activateNotification(notification, onClose));
	root.add_controller(click);

	root.add_css_class("notification");

	const icon = makeIcon(notification);

	const content = new Gtk.Box({
		orientation: Gtk.Orientation.VERTICAL,
		spacing: 4,
	});

	const header = new Gtk.Box({
		orientation: Gtk.Orientation.HORIZONTAL,
		spacing: 8,
	});

	const app = new Gtk.Label({
		label: notification.appName || "Notification",
		hexpand: true,
		halign: Gtk.Align.START,
	});

	const close = new Gtk.Button();
	close.add_css_class("notification-close");
	close.set_child(new Gtk.Label({ label: "×" }));
	close.connect("clicked", () => {
		onClose();
	});

	const summary = new Gtk.Label({
		label: notification.summary ?? "",
		ellipsize: Pango.EllipsizeMode.END,
		widthChars: 38,
		maxWidthChars: 38,
		xalign: 0,
	});

	const bodyText = truncateText(stripMarkup(notification.body ?? ""), 100);
	const body = new Gtk.Label({
		label: bodyText,
		wrap: true,
		ellipsize: Pango.EllipsizeMode.END,
		widthChars: 38,
		maxWidthChars: 38,
		xalign: 0,
		visible: bodyText.length > 0,
	});

	header.append(icon);
	header.append(app);
	header.append(close);

	content.append(summary);
	content.append(body);

	root.append(header);
	root.append(content);

	return root;
}

export default function Notifications() {
	const container = new Gtk.Box({
		orientation: Gtk.Orientation.VERTICAL,
		spacing: 8,
		visible: false,
	});

	container.add_css_class("notifications");

	const widgets = new Map<number, Gtk.Widget>();
	const timers = new Map<number, number>();

	const syncVisibility = () => {
		setWindowVisible(container, widgets.size > 0);
	};

	const clearTimer = (id: number) => {
		const timer = timers.get(id);
		if (timer === undefined) return;

		GLib.source_remove(timer);
		timers.delete(id);
	};

	const remove = (id: number) => {
		clearTimer(id);

		const widget = widgets.get(id);
		if (!widget) {
			syncVisibility();
			return;
		}

		widgets.delete(id);
		container.remove(widget);
		syncVisibility();
	};

	const removeAll = () => {
		for (const id of [...widgets.keys()]) {
			remove(id);
		}

		syncVisibility();
	};

	const dismiss = (notification: Notifd.Notification) => {
		remove(notification.id);
		notification.dismiss();
	};

	const add = (notification: Notifd.Notification) => {
		const id = notification.id;

		remove(id);

		const widget = makeNotification(notification, () => dismiss(notification));

		widgets.set(id, widget);
		container.prepend(widget);
		syncVisibility();

		const timer = GLib.timeout_add(
			GLib.PRIORITY_DEFAULT,
			getTimeout(notification),
			() => {
				timers.delete(id);
				dismiss(notification);

				return GLib.SOURCE_REMOVE;
			},
		);

		timers.set(id, timer);
	};

	const syncFromDaemon = () => {
		const activeIds = new Set(
			notifd.get_notifications().map((notification) => notification.id),
		);

		for (const id of [...widgets.keys()]) {
			if (!activeIds.has(id)) remove(id);
		}

		syncVisibility();
	};

	const notifiedId = notifd.connect("notified", (_, id: number) => {
		const notification = notifd.get_notification(id);

		if (notification) add(notification);
		else syncFromDaemon();
	});

	const resolvedId = notifd.connect("resolved", (_, id: number) => {
		GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
			remove(id);
			syncFromDaemon();

			return GLib.SOURCE_REMOVE;
		});
	});

	container.connect("destroy", () => {
		notifd.disconnect(notifiedId);
		notifd.disconnect(resolvedId);

		for (const timer of timers.values()) {
			GLib.source_remove(timer);
		}

		timers.clear();
		widgets.clear();
	});

	syncFromDaemon();

	return container;
}