import { execAsync } from "ags/process";
import { interval } from "ags/time";
import { createState, onCleanup } from "gnim";

type NiriWorkspace = {
	id: number;
	idx: number;
	name?: string | null;
	output?: string | null;
	is_active?: boolean;
	is_focused?: boolean;
	is_urgent?: boolean;
};

function parseWorkspaces(json: string): number[] {
	try {
		const data = JSON.parse(json);
		if (!Array.isArray(data)) return [];

		return data
			.filter((workspace: NiriWorkspace) => workspace.is_active || workspace.is_focused)
			.map((workspace: NiriWorkspace) => workspace.idx)
			.filter((idx: number) => Number.isFinite(idx));
	} catch {
		return [];
	}
}

async function fetchWorkspaces(): Promise<string> {
	try {
		return await execAsync("niri msg --json workspaces");
	} catch {
		return "[]";
	}
}

export default function Workspaces() {
	const [raw, setRaw] = createState("[]");
	const activeWorkspaces = raw(parseWorkspaces);

	const timer = interval(100, () => {
		fetchWorkspaces().then(setRaw).catch(() => { });
	});
	onCleanup(() => timer.cancel());

	async function switchToWorkspace(id: number) {
		try {
			await execAsync(`niri msg action focus-workspace ${id}`);
			setRaw(await fetchWorkspaces());
		} catch {
			// ignore
		}
	}

	return (
		<box class="workspaces">
			{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => (
				<button
					class={activeWorkspaces((workspaces) =>
						workspaces.includes(id) ? "focused" : "",
					)}
					onClicked={() => switchToWorkspace(id)}
				>
					<label
						label={activeWorkspaces((workspaces) =>
							workspaces.includes(id) ? " " : " ",
						)}
					/>
				</button>
			))}
		</box>
	);
}
