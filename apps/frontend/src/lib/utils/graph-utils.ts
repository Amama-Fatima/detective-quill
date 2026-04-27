export const THEME = {
	background: "#f5f3ef",
	foreground: "#2c2d3a",
	muted: "#5c5d6e",
	border: "#8b9d8b",
	primary: "#2d2f3d",
	chart1: "#2d2f3d",
	chart2: "#4a5a7a",
	chart3: "#a67c52",
	chart4: "#4a7a5c",
	chart5: "#b85c4a",
	destructive: "#c94a4a",
	accent: "#6b7aaa",
} as const;

export const LABEL_COLORS: Record<string, string> = {
	Character: THEME.chart1,
	Location: THEME.chart3,
	Organisation: THEME.chart2,
	Scene: THEME.accent,
};

export function getSceneDescriptionPreview(
	properties: Record<string, unknown>,
) {
	const sceneText =
		typeof properties.scene_text === "string"
			? properties.scene_text
			: typeof properties.description === "string"
				? properties.description
				: "";

	const trimmed = sceneText.trim();
	if (!trimmed) return "Scene...";

	const words = trimmed.split(/\s+/);
	if (words.length <= 5) return words.join(" ");
	return `${words.slice(0, 5).join(" ")}...`;
}
