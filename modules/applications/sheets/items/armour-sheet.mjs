import TrappingSheet from "./trapping-sheet.mjs";

/** @inheritDoc */
export default class ArmourSheet extends TrappingSheet
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
