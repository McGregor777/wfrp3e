import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

/** @inheritDoc */
export default class WFRP3eAbilitySheet extends WFRP3eItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["ability"]};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/items/ability-sheet/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			...super.TABS.sheet,
			labelPrefix: "ABILITY.TABS"
		}
	};
}