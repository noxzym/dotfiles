import { execAsync } from "ags/process";
import { createPoll } from "ags/time";

export default function Clock() {
	const time = createPoll("", 60000, async () => {
		try {
			return await execAsync("date '+%a, %d %b %Y - %R %p'");
		} catch {
			return "";
		}
	});

	return <label label={time} />;
}
