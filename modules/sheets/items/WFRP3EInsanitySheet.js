export default class WFRP3EInsanitySheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/insanity-sheet.html",
			//width: 530,
			height: 300,
			classes: ["wfrp3e", "sheet", "item", "insanity", "insanity-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		return data;
	}
}