export default class WFRP3eConditionSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			template: "systems/wfrp3e/templates/applications/items/condition-sheet.hbs",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "condition"]
		};
	}

	getData()
	{
		return {...super.getData(), conditionDurations: CONFIG.WFRP3e.conditionDurations};
	}
}