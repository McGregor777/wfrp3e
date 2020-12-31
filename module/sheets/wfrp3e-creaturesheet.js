export default class WFRP3CreatureSheet extends ActorSheet
{
	static get defalultOptions()
	{
		return mergeObject(super.defaultOptions, {
			template: "systems/wfrp3e/templates/sheets/creature-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "actor"]
		});
	}
}