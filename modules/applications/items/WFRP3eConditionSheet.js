import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eConditionSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "sheet", "item", "condition"]
		};
	}

	getData()
	{
		return {...super.getData(), conditionDurations: CONFIG.WFRP3e.conditionDurations};
	}
}