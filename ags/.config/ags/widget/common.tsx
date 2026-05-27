import { Gdk, Gtk } from "ags/gtk4";

export function RightClick({ onClicked }: { onClicked: () => void }) {
	return (
		<Gtk.GestureClick
			button={Gdk.BUTTON_SECONDARY}
			onPressed={() => onClicked()}
		/>
	);
}

export function ScrollHandler({
	onUp,
	onDown,
}: {
	onUp: () => void;
	onDown: () => void;
}) {
	return (
		<Gtk.EventControllerScroll
			flags={Gtk.EventControllerScrollFlags.VERTICAL}
			onScroll={(_, dx, dy) => {
				if (dy < 0) onUp();
				else onDown();
			}}
		/>
	);
}

export const Divider = () => <label label=" | " />;
