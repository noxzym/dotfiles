import { execAsync } from "ags/process";

export default function Powermenu() {
	return (
		<button
			onClicked={() => execAsync("/home/noxzym/.config/rofi/power.sh").catch(printerr)}
		>
			<label label="⏻" />
		</button>
	);
}
