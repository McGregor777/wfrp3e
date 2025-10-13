import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

/** @inheritDoc */
export default class WFRP3eTrappingSheet extends WFRP3eItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["trapping"]};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/items/trapping-sheet/main.hbs"},
		details: {template: "systems/wfrp3e/templates/applications/items/details.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "main", icon: "fa-solid fa-book"},
				{id: "details", icon: "fa-solid fa-scroll"},
				{id: "effects", icon: "fa-fw fa-solid fa-person-rays"}
			],
			initial: "main",
			labelPrefix: "TRAPPING.TABS"
		}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		const partContext = await super._preparePartContext(partId, context);

		if(partId === "details")
			partContext.fields = this.item.system.schema.fields;

		return partContext;
	}
}