export default class WFRP3eActionSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/action-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "action", "action-item-sheet"],
			tabs: [{group: "primary", navSelector: ".action-sheet-tabs", contentSelector: ".action-sheet-body", initial: "conservative"}]
		});
	}

	getData()
	{
		const data = super.getData();

		data.actionTypes = CONFIG.WFRP3e.actionTypes;
		data.effectSymbols = CONFIG.WFRP3e.effectSymbols;
		data.stances = CONFIG.WFRP3e.stances;

		return data;
	}
}