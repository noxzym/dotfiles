import { execAsync } from "ags/process";
import GLib from "gi://GLib";

export default function Powermenu() {
	return (
		<button
			onClicked={() => execAsync("/home/noxzym/.config/rofi/power.sh").catch(printerr)}
		>
			<label label={`󰣇 ${GLib.getenv("USER") ?? ""}`} />
		</button>
	);
}
