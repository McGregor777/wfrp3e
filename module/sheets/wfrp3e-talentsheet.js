export default class WFRP3TalentSheet extends ItemSheet
{
	static get defalultOptions()
	{
		return mergeObject(super.defaultOptions, {
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "talent"]
		});
	}

	get template()
	{
		return `systems/wfrp3e/templates/sheets/talent-sheet.html`;
	}

	getData()
	{
		const data = super.getData();

		data.config = CONFIG.wfrp3e;

		return data;
	}
}