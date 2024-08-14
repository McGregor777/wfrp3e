import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eMoneySheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "sheet", "item", "money"]
		};
	}
}