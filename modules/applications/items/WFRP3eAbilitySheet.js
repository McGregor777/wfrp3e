export default class WFRP3eAbilitySheet extends ItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			template: "systems/wfrp3e/templates/applications/items/ability-sheet.hbs",
			//width: 530,
			height: 300,
			classes: ["wfrp3e", "sheet", "item", "ability"]
		};
	}

	getData()
	{
		return super.getData();
	}
}