export default class WFRP3ActorSheet extends ActorSheet
{
	static get defalultOptions()
	{
		return mergeObject(super.defaultOptions, {
			template: "systems/wfrp3e/templates/sheets/actor-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "actor"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.config = CONFIG.wfrp3e;

		data.weapons = data.items.filter(function(item) {return item.type == "weapon"})

		return data;
	}
}