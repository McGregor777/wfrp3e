import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eTrappingSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "sheet", "item", "trapping"],
			tabs: [{group: "primary", navSelector: ".primary-tabs", contentSelector: ".sheet-body", initial: "main"}]
		};
	}

	getData()
	{
		return {...super.getData(), rarities: CONFIG.WFRP3e.rarities};
	}
}