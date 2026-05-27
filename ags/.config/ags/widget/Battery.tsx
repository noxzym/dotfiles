import { execAsync } from "ags/process";
import { createPoll } from "ags/time";

export default function Battery() {
	const battery = createPoll("", 10000, async (prev) => {
		try {
			const [capacity, status] = (
				await execAsync(
					"sh -c 'cat /sys/class/power_supply/BAT*/capacity /sys/class/power_supply/BAT*/status 2>/dev/null'",
				)
			).split("\n");
			const pct = Number(capacity);

			if (!Number.isFinite(pct)) return "";

			let icon = "";
			if (pct >= 80) icon = "";
			else if (pct >= 60) icon = "";
			else if (pct >= 40) icon = "";
			else if (pct >= 20) icon = "";

			return status === "Charging"
				? `${icon} 󱐋 ${pct}%`
				: `${icon}  ${pct}%`;
		} catch {
			return prev;
		}
	});

	return <label label={battery} />;
}
