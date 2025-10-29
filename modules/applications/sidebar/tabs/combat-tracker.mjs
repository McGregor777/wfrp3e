/** @inheritDoc */
export default class CombatTracker extends foundry.applications.sidebar.tabs.CombatTracker
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {actions: {switchEncounterType: this.#switchEncounterType}};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		header: {template: "systems/wfrp3e/templates/sidebar/tabs/combat/header.hbs"}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		const partContext = await super._preparePartContext(partId, context);

		if(partId === "header")
			partContext.encounterTypes = CONFIG.WFRP3e.encounterTypes;

		return partContext;
	}

	/**
	 * Switches the encounter type of the combat.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #switchEncounterType(event, target)
	{
		this.viewed.update({"system.type": target.value});
	}
}
