export default class WFRP3EDiseaseSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/disease-sheet.html",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "disease", "disease-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.diseaseKeywords = CONFIG.WFRP3E.diseaseKeywords;

		return data;
	}
}