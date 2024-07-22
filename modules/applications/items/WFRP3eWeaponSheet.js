import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eWeaponSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			height: 600,
			classes: ["wfrp3e", "sheet", "item", "trapping", "weapon"],
			tabs: [{group: "primary", navSelector: ".primary-tabs", contentSelector: ".sheet-body", initial: "main"}]
		};
	}

	getData()
	{
		return {
			...super.getData(),
			rarities: CONFIG.WFRP3e.rarities,
			qualities: CONFIG.WFRP3e.weapon.qualities,
			qualitiesWithRating: ["attuned", "pierce", "unreliable"],
			groups: CONFIG.WFRP3e.weapon.groups,
			ranges: CONFIG.WFRP3e.weapon.ranges
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".quality-add").click(this._onQualityAddClick.bind(this));
		html.find(".quality-remove").click(this._onQualityRemoveClick.bind(this));
	}

	/**
	 * Performs follow-up operations after clicks on a Quality addition icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onQualityAddClick(event)
	{
		this.item.addNewQuality();
	}

	/**
	 * Performs follow-up operations after clicks on a Quality removal icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onQualityRemoveClick(event)
	{
		this.item.removeLastQuality();
	}
}