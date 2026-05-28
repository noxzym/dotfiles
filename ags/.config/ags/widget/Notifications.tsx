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

function makeNotification(notification: Notifd.Notification, onClose: () => void) {
	const root = new Gtk.Box({
		orientation: Gtk.Orientation.VERTICAL,
		spacing: 4,
	});

	root.add_css_class("notification");

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
	close.set_child(new Gtk.Label({ label: "×" }));
	close.connect("clicked", onClose);

	const summary = new Gtk.Label({
		label: notification.summary ?? "",
		xalign: 0,
	});

	const bodyText = notification.body ?? "";
	const body = new Gtk.Label({
		label: bodyText,
		wrap: true,
		xalign: 0,
		visible: bodyText.length > 0,
	});

	header.append(app);
	header.append(close);

	root.append(header);
	root.append(summary);
	root.append(body);

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