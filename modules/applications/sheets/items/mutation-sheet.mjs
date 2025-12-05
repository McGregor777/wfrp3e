import ItemSheet from "./item-sheet.mjs";

/** @inheritDoc */
export default class MutationSheet extends ItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["mutation"]};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/sheets/items/mutation-sheet/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/sheets/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			...super.TABS.sheet,
			labelPrefix: "MUTATION.TABS"
		}
	};
}
