import ItemSheet from "./item-sheet.mjs";

/** @inheritDoc */
export default class ConditionSheet extends ItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["condition"]};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/sheets/items/condition-sheet/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/sheets/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			...super.TABS.sheet,
			labelPrefix: "CONDITION.TABS"
		}
	};
}
