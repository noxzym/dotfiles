import Wp from "gi://AstalWp";
import { execAsync } from "ags/process";
import { createBinding } from "gnim";
import { RightClick, ScrollHandler } from "./common";

const STEP = 0.05;

function clamp(value: number) {
	return Math.min(1, Math.max(0, value));
}

function icon(value: number, isMuted: boolean) {
	if (isMuted || value === 0) return "󰝟 Muted";
	if (value < 0.34) return ` ${Math.round(value * 100)}%`;
	if (value < 0.67) return ` ${Math.round(value * 100)}%`;
	return ` ${Math.round(value * 100)}%`;
}

export default function Audio() {
	const speaker = Wp.get_default().defaultSpeaker;
	const volume = createBinding(speaker, "volume");
	const mute = createBinding(speaker, "mute");
	const label = volume.as((value) => icon(value, speaker.mute));

	function adjust(delta: number) {
		speaker.volume = clamp(speaker.volume + delta);
	}

	function toggleMute() {
		speaker.mute = !speaker.mute;
	}

	return (
		<button onClicked={toggleMute}>
			<RightClick onClicked={() => execAsync("pavucontrol").catch(() => { })} />
			<ScrollHandler
				onUp={() => adjust(STEP)}
				onDown={() => adjust(-STEP)}
			/>
			<label label={label} />
		</button>
	);
}
