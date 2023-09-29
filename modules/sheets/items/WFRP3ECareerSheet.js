export default class WFRP3ECareerSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/career-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "career", "career-item-sheet"],
		});
	}

	getData()
	{
		const data = super.getData();

		data.characteristics = CONFIG.WFRP3E.characteristics;
		data.talentTypes = CONFIG.WFRP3E.talentTypes;

		return data;
	}

	/*
	 * Activate event listeners using the prepared sheet HTML
	 *
	 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".talent-socket-add").click(this._onTalentSocketAdd.bind(this));
		html.find(".talent-socket-remove").click(this._onTalentSocketDelete.bind(this));
	}

	/**
	 * Performs follow-up operations after clicks on a Talent socket add icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onTalentSocketAdd(event)
	{
		const talentSockets = this.item.system.talentSockets;

		talentSockets.push("focus");

		this.item.update({"system.talentSockets": talentSockets});
	}

	/**
	 * Performs follow-up operations after clicks on a Talent socket delete icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onTalentSocketDelete(event)
	{
		const talentSockets = this.item.system.talentSockets;

		talentSockets.pop();

		this.item.update({"system.talentSockets": talentSockets});
	}
}