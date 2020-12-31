export default class WFRP3ItemSheet extends ItemSheet
{
	static get defalultOptions()
	{
		return mergeObject(super.defaultOptions, {
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "skill"]
		});
	}

	get template()
	{
		return `systems/wfrp3e/templates/sheets/item-sheet.html`;
	}

	getData()
	{
		const data = super.getData();

		data.config = CONFIG.wfrp3e;

		return data;
	}
}