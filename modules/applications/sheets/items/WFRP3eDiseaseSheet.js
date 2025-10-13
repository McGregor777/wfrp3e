import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

/** @inheritDoc */
export default class WFRP3eDiseaseSheet extends WFRP3eItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["disease"]}

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/items/disease-sheet/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			...super.TABS.sheet,
			labelPrefix: "DISEASE.TABS"
		}
	};
}