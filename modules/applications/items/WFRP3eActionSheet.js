import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eActionSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			width: 600,
			height: 690,
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
		html.find(".effect-edit").click(this._onEffectEditorButtonClick.bind(this));
		html.find(".effect-remove").click(this._onRemoveEffectButtonClick.bind(this));
	}

	/**
	 * Performs follow-up operations after clicks on an effect addition button.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onAddEffectButtonClick(event)
	{
		this.item.createEffect(event.currentTarget.closest("section[data-face]").dataset.face);
	}

	/**
	 * Performs follow-up operations after clicks on an effect editor button.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onEffectEditorButtonClick(event)
	{
		this.item.editEffect(
			event.currentTarget.closest("section[data-face]").dataset.face,
			event.currentTarget.closest("div.effect-group[data-symbol]").dataset.symbol,
			event.currentTarget.closest("div.effect[data-index]").dataset.index
		);
	}

	/**
	 * Performs follow-up operations after clicks on an effect removal button.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onRemoveEffectButtonClick(event)
	{

		await foundry.applications.api.DialogV2.confirm({
			window: {title: game.i18n.localize("DIALOG.TITLE.EffectDeletion")},
			modal: true,
			content: `<p>${game.i18n.localize("DIALOG.DESCRIPTION.EffectDeletion")}</p>`,
			submit: (result) => {
				if(result)
					this.item.removeEffect(
						event.currentTarget.closest("section[data-face]").dataset.face,
						event.currentTarget.closest("div.effect-group[data-symbol]").dataset.symbol,
						event.currentTarget.closest("div.effect[data-index]").dataset.index
					);
			}
		});
	}
}