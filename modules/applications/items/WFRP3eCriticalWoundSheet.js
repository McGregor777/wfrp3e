import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eCriticalWoundSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "sheet", "item", "critical-wound"]
		};
	}
}