import BatteryService from "gi://AstalBattery";
import { createState, onCleanup } from "gnim";

const battery = BatteryService.get_default();

function iconFor(percentage: number) {
	if (percentage >= 0.9) return "";
	if (percentage >= 0.65) return "";
	if (percentage >= 0.4) return "";
	if (percentage >= 0.15) return "";
	return "";
}

function isCharging() {
	return battery.charging || battery.state === BatteryService.State.CHARGING;
}

function format() {
	if (!battery.isPresent || !battery.isBattery) return "";
	return `${isCharging() && battery.percentage < 1 ? "󱐋" : ""}${iconFor(battery.percentage)} ${Math.round(battery.percentage * 100)}%`;
}

export default function Battery() {
	const [label, setLabel] = createState(format());
	const update = () => setLabel(format());

	const subscriptions = [
		battery.connect("notify::percentage", update),
		battery.connect("notify::charging", update),
		battery.connect("notify::state", update),
		battery.connect("notify::is-present", update),
		battery.connect("notify::is-battery", update),
	];

	onCleanup(() => {
		for (const id of subscriptions) battery.disconnect(id);
	});

	return <label label={label} />;
}
