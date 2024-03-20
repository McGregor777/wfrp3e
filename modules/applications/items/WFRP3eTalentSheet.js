export default class WFRP3eTalentSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			template: "systems/wfrp3e/templates/applications/items/talent-sheet.hbs",
			//width: 530,
			height: 250,
			classes: ["wfrp3e", "sheet", "item", "talent"]
		};
	}

	getData()
	{
		return {...super.getData(), talentTypes: CONFIG.WFRP3e.talentTypes};
	}
}