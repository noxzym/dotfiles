import NetworkService from "gi://AstalNetwork";
import { execAsync } from "ags/process";
import { createState, onCleanup } from "gnim";

const network = NetworkService.get_default();

function formatNetwork() {
	if (network.primary === NetworkService.Primary.WIFI && network.wifi) {
		const ssid = network.wifi.ssid || "Wi-Fi";
		return `󰖩 ${ssid} ${network.wifi.strength}%`;
	}

	if (network.primary === NetworkService.Primary.WIRED && network.wired) {
		return "󰛳 Wired";
	}

	if (network.wifi?.enabled === false) {
		return "󰤮 Wi-Fi Off";
	}

	return "󱘖 No Network";
}

export default function Network() {
	const [label, setLabel] = createState(formatNetwork());
	const update = () => setLabel(formatNetwork());
	const subscriptions: Array<[NetworkService.Network | NetworkService.Wifi | NetworkService.Wired, number]> = [];

	subscriptions.push([network, network.connect("notify::primary", update)]);
	subscriptions.push([network, network.connect("notify::wifi", update)]);
	subscriptions.push([network, network.connect("notify::wired", update)]);

	if (network.wifi) {
		subscriptions.push([network.wifi, network.wifi.connect("notify::ssid", update)]);
		subscriptions.push([network.wifi, network.wifi.connect("notify::strength", update)]);
		subscriptions.push([network.wifi, network.wifi.connect("notify::enabled", update)]);
		subscriptions.push([network.wifi, network.wifi.connect("notify::state", update)]);
	}

	if (network.wired) {
		subscriptions.push([network.wired, network.wired.connect("notify::state", update)]);
		subscriptions.push([network.wired, network.wired.connect("notify::internet", update)]);
	}

	onCleanup(() => {
		for (const [object, id] of subscriptions) object.disconnect(id);
	});

	return (
		<button onClicked={() => execAsync("adwaita-network").catch(() => { })}>
			<label label={label} />
		</button>
	);
}
