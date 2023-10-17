export default class WFRP3eMutationSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/mutation-sheet.hbs",
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