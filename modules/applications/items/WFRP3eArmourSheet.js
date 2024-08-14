import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eArmourSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			height: 400,
			classes: ["wfrp3e", "sheet", "item", "trapping", "armour"],
			tabs: [{group: "primary", navSelector: ".primary-tabs", contentSelector: ".sheet-body", initial: "main"}]
		};
	}

	getData()
	{
		return {...super.getData(), rarities: CONFIG.WFRP3e.rarities};
	}
}