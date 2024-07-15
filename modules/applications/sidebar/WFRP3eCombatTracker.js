/** @inheritDoc */
export default class WFRP3eCombatTracker extends CombatTracker
{
	/** @inheritdoc */
	static get defaultOptions()
	{
		return foundry.utils.mergeObject(super.defaultOptions, {template: "systems/wfrp3e/templates/applications/sidebar/combat-tracker.hbs"});
	}

	/** @inheritdoc */
	async getData(options = {})
	{
		return foundry.utils.mergeObject(await super.getData(options), {encounterTypes: CONFIG.WFRP3e.encounterTypes});
	}

	/** @inheritdoc */
	activateListeners(html)
	{
		super.activateListeners(html);
		html.find(".combat-input").change(this._onCombatInput.bind(this));
	}

	/**
	 * Handle changes events on Combat inputs.
	 * @private
	 * @param {Event} event The originating event
	 */
	async _onCombatInput(event)
	{
		event.preventDefault();

		const value = event.currentTarget.value;
		const updates = {};

		updates[event.currentTarget.name] = Array.isArray(value) || isNaN(value) ? value : Number(value);

		this.viewed.update(updates);
	}
}
