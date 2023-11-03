export default class WFRP3eTalentSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/items/talent-sheet.hbs",
			//width: 530,
			height: 250,
			classes: ["wfrp3e", "sheet", "item", "talent", "talent-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.talentTypes = CONFIG.WFRP3e.talentTypes;

		return data;
	}
}