export default class WFRP3EAbilitySheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/ability-sheet.html",
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