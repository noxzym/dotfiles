import { execAsync } from "ags/process";
import { createPoll } from "ags/time";

export default function Network() {
	const network = createPoll("󱘖 No Network", 5000, async (prev) => {
		try {
			const out = await execAsync(
				"nmcli -t -f DEVICE,TYPE,STATE,CONNECTION device status",
			);
			for (const line of out.split("\n")) {
				const [device, type, state, connection] = line.split(":");
				if (state === "connected") {
					if (type === "wifi") return `󰖩 ${connection || device}`;
					return `󰛳 ${device}`;
				}
			}
			return "󱘖 No Network";
		} catch {
			return prev;
		}
	});

	return (
		<button onClicked={() => execAsync("adwaita-network").catch(printerr)}>
			<label label={network} />
		</button>
	);
}
