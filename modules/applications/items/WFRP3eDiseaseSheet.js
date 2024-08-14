import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eDiseaseSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "sheet", "item", "disease"]
		};
	}

	getData()
	{
		return {...super.getData(), diseaseSymptoms: CONFIG.WFRP3e.disease.symptoms};
	}
}