export default class WFRP3EConditionSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/condition-sheet.html",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "condition", "condition-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.conditionDuration = CONFIG.WFRP3E.conditionDuration;

		return data;
	}
}