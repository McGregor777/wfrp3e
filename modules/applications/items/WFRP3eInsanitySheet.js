export default class WFRP3eInsanitySheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/items/insanity-sheet.hbs",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "insanity"]
		});
	}

	getData()
	{
		const data = super.getData();

		return data;
	}
}