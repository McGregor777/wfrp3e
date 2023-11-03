export default class WFRP3eAbilitySheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/items/ability-sheet.hbs",
			//width: 530,
			height: 300,
			classes: ["wfrp3e", "sheet", "item", "ability", "ability-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		return data;
	}
}