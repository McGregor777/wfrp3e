export default class WFRP3EActionSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/action-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "action"],
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "conservative" }]
		});
	}

	getData()
	{
		const data = super.getData();

		data.actionTypes = CONFIG.WFRP3E.actionTypes;

		return data;
	}
}