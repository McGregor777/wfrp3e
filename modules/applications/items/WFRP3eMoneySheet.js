export default class WFRP3eMoneySheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/items/money-sheet.hbs",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "money", "money-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		return data;
	}
}