export default class WFRP3eGroupSheet extends ActorSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/actors/group-sheet.hbs",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "actor", "group", "group-sheet"]
		});
	}
}