import WFRP3eTrappingSheet from "./WFRP3eTrappingSheet.js";

/** @inheritDoc */
export default class WFRP3eArmourSheet extends WFRP3eTrappingSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["armour"]};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/sheets/items/armour-sheet/main.hbs"},
		details: {template: "systems/wfrp3e/templates/applications/sheets/items/details.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/sheets/items/effects.hbs"}
	};
}
