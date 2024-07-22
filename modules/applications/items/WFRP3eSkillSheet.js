import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eSkillSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "sheet", "item", "skill"]
		};
	}

	getData()
	{
		return {...super.getData(), characteristics: CONFIG.WFRP3e.characteristics};
	}
}