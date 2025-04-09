import WFRP3eTrappingSheetV2 from "./WFRP3eTrappingSheetV2.js";

/** @inheritDoc */
export default class WFRP3eArmourSheetV2 extends WFRP3eTrappingSheetV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: [...this.DEFAULT_OPTIONS.classes, "armour"]
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/armour-sheet-v2/main.hbs"},
		details: {template: "systems/wfrp3e/templates/applications/items/details.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	}

	/**
	 * Prepares an array of form footer buttons.
	 * @returns {Partial<FormFooterButton>[]}
	 */
	_getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-save", label: "ARMOUR.ACTIONS.update"}]
	}
}