export default class WFRP3EMutationSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/mutation-sheet.html",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "mutation", "mutation-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		return data;
	}
}