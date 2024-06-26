export default class WFRP3eActionSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			template: "systems/wfrp3e/templates/applications/items/action-sheet.hbs",
			width: 550,
			height: 680,
			classes: ["wfrp3e", "sheet", "item", "action"],
			tabs: [
				{group: "face", navSelector: ".face-tabs", contentSelector: ".sheet-body", initial: "conservative.tab"},
				{group: "conservative", navSelector: ".conservative-tabs", contentSelector: ".conservative.tab", initial: "main"},
				{group: "reckless", navSelector: ".reckless-tabs", contentSelector: ".reckless.tab", initial: "main"}
			]
		};
	}

	getData()
	{
		return {
			...super.getData(),
			actionTypes: CONFIG.WFRP3e.actionTypes,
			stances: CONFIG.WFRP3e.stances,
			symbols: CONFIG.WFRP3e.symbols
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".effect-add").click(this._onAddEffectButtonClick.bind(this));
		html.find(".effect-remove").click(this._onRemoveEffectButtonClick.bind(this));
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