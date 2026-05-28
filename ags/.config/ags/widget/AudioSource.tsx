import Wp from "gi://AstalWp";
import { execAsync } from "ags/process";
import { createState, onCleanup } from "gnim";
import { RightClick, ScrollHandler } from "./common";

const STEP = 0.05;

function clamp(value: number) {
	return Math.min(1, Math.max(0, value));
}

function icon(value: number, isMuted: boolean) {
	return isMuted || value === 0
		? " Muted"
		: ` ${Math.round(value * 100)}%`;
}

export default function AudioSource() {
	const microphone = Wp.get_default().defaultMicrophone;
	const [label, setLabel] = createState(icon(microphone.volume, microphone.mute));
	const update = () => setLabel(icon(microphone.volume, microphone.mute));

	const subscriptions = [
		microphone.connect("notify::volume", update),
		microphone.connect("notify::mute", update),
	];

	onCleanup(() => {
		for (const id of subscriptions) microphone.disconnect(id);
	});

	function adjust(delta: number) {
		microphone.volume = clamp(microphone.volume + delta);
	}

	function toggleMute() {
		microphone.mute = !microphone.mute;
		update();
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
