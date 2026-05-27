import { execAsync } from "ags/process";
import { interval } from "ags/time";
import { createState, onCleanup } from "gnim";
import { RightClick, ScrollHandler } from "./common";

export default function AudioSource() {
	const [source, setSource] = createState("󰍬 0%");

	function updateVolume(out: string) {
		const volume = Math.round(
			Number(out.match(/[0-9.]+/)?.[0] || 0) * 100,
		);
		setSource(out.includes("MUTED") ? `󰍭 ${volume}%` : `󰍬 ${volume}%`);
	}

	const timer = interval(1000, () => {
		execAsync("wpctl get-volume @DEFAULT_AUDIO_SOURCE@")
			.then(updateVolume)
			.catch(() => {});
	});
	onCleanup(() => timer.cancel());

	async function toggleMute() {
		try {
			await execAsync("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle");
			const out = await execAsync("wpctl get-volume @DEFAULT_AUDIO_SOURCE@");
			updateVolume(out);
		} catch {
			// ignore
		}
	}

	async function adjust(delta: string) {
		try {
			await execAsync(`wpctl set-volume --limit 1.0 @DEFAULT_AUDIO_SOURCE@ ${delta}`);
			const out = await execAsync("wpctl get-volume @DEFAULT_AUDIO_SOURCE@");
			updateVolume(out);
		} catch {
			// ignore
		}
	}

	return (
		<button onClicked={toggleMute}>
			<RightClick onClicked={() => execAsync("pavucontrol").catch(printerr)} />
			<ScrollHandler
				onUp={() => adjust("5%+")}
				onDown={() => adjust("5%-")}
			/>
			<label label={source} />
		</button>
	);
}
