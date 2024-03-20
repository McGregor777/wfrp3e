export default class WFRP3eArmourSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			template: "systems/wfrp3e/templates/applications/items/armour-sheet.hbs",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "trapping", "armour"],
			tabs: [{group: "primary", navSelector: ".primary-tabs", contentSelector: ".sheet-body", initial: "main"}]
		};
	}

	getData()
	{
		return {...super.getData(), rarities: CONFIG.WFRP3e.rarities};
	}
}