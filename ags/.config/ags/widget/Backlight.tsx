import Brightness from "gi://AstalBrightness";
import { createBinding } from "gnim";
import { ScrollHandler } from "./common";

const STEP = 0.05;

function clamp(value: number) {
	return Math.min(1, Math.max(0, value));
}

export default function Backlight() {
	const screen = Brightness.get_default().screen;
	const brightness = createBinding(screen, "brightness");

	function adjust(delta: number) {
		screen.brightness = clamp(screen.brightness + delta);
	}

	return (
		<box>
			<ScrollHandler
				onUp={() => adjust(STEP)}
				onDown={() => adjust(-STEP)}
			/>
			<label label={brightness.as((value) => `󰖨 ${Math.round(value * 100)}%`)} />
		</box>
	);
}
