export default class WFRP3eMiscastSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/miscast-sheet.hbs",
			//width: 530,
			height: 300,
			classes: ["wfrp3e", "sheet", "item", "miscast", "miscast-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		return data;
	}
}