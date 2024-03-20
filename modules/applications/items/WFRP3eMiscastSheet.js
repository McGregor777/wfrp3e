export default class WFRP3eMiscastSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			template: "systems/wfrp3e/templates/applications/items/miscast-sheet.hbs",
			//width: 530,
			height: 300,
			classes: ["wfrp3e", "sheet", "item", "miscast"]
		};
	}

	getData()
	{
		return super.getData();
	}
}