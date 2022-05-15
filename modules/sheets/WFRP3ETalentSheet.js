export default class WFRP3ETalentSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/talent-sheet.html",
			//width: 530,
			height: 250,
			classes: ["wfrp3e", "sheet", "item", "talent"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.talentTypes = CONFIG.WFRP3E.talentTypes;

		return data;
	}
}