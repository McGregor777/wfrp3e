export default class WFRP3eActionSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/action-sheet.html",
			width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "action", "action-item-sheet"],
			tabs: [
				{group: "face", navSelector: ".action-sheet-face-tabs", contentSelector: ".action-sheet-body", initial: "conservative"},
				{group: "conservative", navSelector: ".action-sheet-conservative-tabs", contentSelector: ".action-sheet-conservative", initial: "main"},
				{group: "reckless", navSelector: ".action-sheet-reckless-tabs", contentSelector: ".action-sheet-reckless", initial: "main"}
			]
		});
	}

	getData()
	{
		const data = super.getData();

		data.actionTypes = CONFIG.WFRP3e.actionTypes;
		data.effectSymbols = CONFIG.WFRP3e.effectSymbols;
		data.stances = CONFIG.WFRP3e.stances;

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".action-sheet-effect-add").click(this._onAddEffectButtonClick.bind(this));
		html.find(".action-sheet-effect-remove").click(this._onRemoveEffectButtonClick.bind(this));
	}

	/**
	 * Performs follow-up operations after clicks on effect addition button.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onAddEffectButtonClick(event)
	{
		this.item.addNewEffect(event.currentTarget.dataset.face, event.currentTarget.dataset.symbol);
	}

	/**
	 * Performs follow-up operations after clicks on effect removal button.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onRemoveEffectButtonClick(event)
	{
		this.item.removeEffect(event.currentTarget.dataset.face, event.currentTarget.dataset.symbol, event.currentTarget.dataset.index);
	}
}