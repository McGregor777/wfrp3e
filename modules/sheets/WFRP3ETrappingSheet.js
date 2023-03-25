export default class WFRP3ETrappingSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/trapping-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "trapping", "trapping-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.rarities = CONFIG.WFRP3E.rarities;

		return data;
	}
}