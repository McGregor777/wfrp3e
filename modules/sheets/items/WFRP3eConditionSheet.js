export default class WFRP3eConditionSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/condition-sheet.hbs",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "condition", "condition-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.conditionDurations = CONFIG.WFRP3e.conditionDurations;

		return data;
	}
}