export default class WFRP3EGroupSheet extends ActorSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/group-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "actor", "group", "group-sheet"]
		});
	}
}