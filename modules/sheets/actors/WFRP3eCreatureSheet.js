export default class WFRP3eCreatureSheet extends ActorSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/creature-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "actor", "creature", "creature-sheet"]
		});
	}
}