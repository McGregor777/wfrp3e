export default class WFRP3eWeaponSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/weapon-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "weapon", "weapon-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.rarities = CONFIG.WFRP3e.rarities;
		data.qualities = CONFIG.WFRP3e.weapon.qualities;
		data.qualitiesWithRating = ["attuned", "pierce", "unreliable"];
		data.groups = CONFIG.WFRP3e.weapon.groups;
		data.ranges = CONFIG.WFRP3e.weapon.ranges;

		return data;
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