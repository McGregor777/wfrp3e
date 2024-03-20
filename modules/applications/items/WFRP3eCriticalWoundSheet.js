export default class WFRP3eCriticalWoundSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			template: "systems/wfrp3e/templates/applications/items/critical-wound-sheet.hbs",
			//width: 530,
			height: 300,
			classes: ["wfrp3e", "sheet", "item", "critical-wound"]
		};
	}

	getData()
	{
		return super.getData();
	}
}