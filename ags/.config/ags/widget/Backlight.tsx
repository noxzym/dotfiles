import { execAsync } from "ags/process";
import { interval } from "ags/time";
import { createState, onCleanup } from "gnim";
import { ScrollHandler } from "./common";

export default function Backlight() {
	const [backlight, setBacklight] = createState("󰖨 0%");

	const timer = interval(2000, () => {
		execAsync("brightnessctl info")
			.then((out) => {
				const pct = out.match(/\((\d+)%\)/)?.[1] || "0";
				setBacklight(`󰖨 ${pct}%`);
			})
			.catch(() => { });
	});
	onCleanup(() => timer.cancel());

	async function adjust(delta: string) {
		try {
			const out = await execAsync(`brightnessctl set ${delta}`);
			const pct = out.match(/\((\d+)%\)/)?.[1] || "0";
			setBacklight(`󰖨 ${pct}%`);
		} catch {
			// ignore
		}
	}

	return (
		<button>
			<ScrollHandler
				onUp={() => adjust("+5%")}
				onDown={() => adjust("5%-")}
			/>
			<label label={backlight} />
		</button>
	);
}
