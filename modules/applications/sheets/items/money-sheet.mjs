import ItemSheet from "./item-sheet.mjs";

/** @inheritDoc */
export default class MoneySheet extends ItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["money"]};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/sheets/items/money-sheet/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/sheets/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			...super.TABS.sheet,
			labelPrefix: "MONEY.TABS"
		}
	};
}
