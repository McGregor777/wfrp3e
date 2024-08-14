import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eTalentSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "sheet", "item", "talent"]
		};
	}

	getData()
	{
		return {...super.getData(), talentTypes: CONFIG.WFRP3e.talentTypes};
	}
}