import ItemSheet from "./item-sheet.mjs";

/** @inheritDoc */
export default class SkillSheet extends ItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["skill"]};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/sheets/items/skill-sheet/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/sheets/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			...super.TABS.sheet,
			labelPrefix: "SKILL.TABS"
		}
	};
}
