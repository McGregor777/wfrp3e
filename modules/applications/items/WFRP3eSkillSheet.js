export default class WFRP3eSkillSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/items/skill-sheet.hbs",
			//width: 530,
			height: 340,
			classes: ["wfrp3e", "sheet", "item", "skill"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.characteristics = CONFIG.WFRP3e.characteristics;

		return data;
	}
}