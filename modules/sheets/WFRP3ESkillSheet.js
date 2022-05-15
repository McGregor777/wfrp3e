export default class WFRP3ESkillSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/skill-sheet.html",
			//width: 530,
			height: 340,
			classes: ["wfrp3e", "sheet", "item", "skill"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.characteristics = CONFIG.WFRP3E.characteristics;

		return data;
	}
}