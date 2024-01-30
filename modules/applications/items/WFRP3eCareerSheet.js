export default class WFRP3eCareerSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/items/career-sheet.hbs",
			//width: 530,
			height: 820,
			classes: ["wfrp3e", "sheet", "item", "career", "career-item-sheet"],
			tabs: [{group: "primary", navSelector: ".career-sheet-tabs", contentSelector: ".career-sheet-body", initial: "header"}]
		});
	}

	getData()
	{
		const data = super.getData();

		data.characteristics = CONFIG.WFRP3e.characteristics;
		data.talentTypes = Object.assign(CONFIG.WFRP3e.talentTypes, {any: "TALENT.TYPE.Any"});

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".talent-socket-add").click(this._onTalentSocketAddClick.bind(this));
		html.find(".talent-socket-remove").click(this._onTalentSocketRemoveClick.bind(this));
	}

	/**
	 * Performs follow-up operations after clicks on a Talent socket addition icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onTalentSocketAddClick(event)
	{
		this.item.addNewTalentSocket();
	}

	/**
	 * Performs follow-up operations after clicks on a Talent socket removal icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onTalentSocketRemoveClick(event)
	{
		this.item.removeLastTalentSocket();
	}
}