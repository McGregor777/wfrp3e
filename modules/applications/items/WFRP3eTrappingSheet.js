export default class WFRP3eTrappingSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/items/trapping-sheet.hbs",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "trapping"],
			tabs: [
				{group: "primary", navSelector: ".primary-tabs", contentSelector: ".sheet-body", initial: "main"},
			]
		});
	}

	getData()
	{
		const data = super.getData();

		data.rarities = CONFIG.WFRP3e.rarities;

		return data;
	}
}