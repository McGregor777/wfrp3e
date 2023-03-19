export default class WFRP3EMoneySheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/money-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "money", "money-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		return data;
	}
}