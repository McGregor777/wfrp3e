export default class WFRP3eDiseaseSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/items/disease-sheet.hbs",
			//width: 530,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "disease"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.diseaseSymptoms = CONFIG.WFRP3e.disease.symptoms;

		return data;
	}
}