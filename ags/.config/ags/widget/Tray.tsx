import AstalTray from "gi://AstalTray"
import { createBinding, For } from "gnim"
import { Gdk, Gtk } from "ags/gtk4"

function onRightClick(self: Gtk.Widget, item: AstalTray.TrayItem) {
	const menu = item.get_menu_model()
	if (!menu) return

	const popover = Gtk.PopoverMenu.new_from_model(menu)
	popover.set_parent(self)
	popover.popup()
}

export default function Tray() {
	const tray = AstalTray.Tray.get_default()
	const items = createBinding(tray, "items")

	return (
		<box class="tray" spacing={4} visible={items.as((items) => items.length > 0)}>
			<For each={items} id={(item: AstalTray.TrayItem) => item.item_id}>
				{(item: AstalTray.TrayItem) => (
					<button
						onClicked={() => item.activate(0, 0)}
						tooltip-text={item.tooltip_text}
						$={(self: Gtk.Widget) => {
							const group = item.get_action_group()
							if (group) self.insert_action_group("dbusmenu", group)

							const gesture = Gtk.GestureClick.new()
							gesture.set_button(Gdk.BUTTON_SECONDARY)
							gesture.connect("pressed", () => onRightClick(self, item))
							self.add_controller(gesture)
						}}
					>
						<image gicon={createBinding(item, "gicon")} pixel-size={16} />
					</button>
				)}
			</For>
		</box>
	)
}
