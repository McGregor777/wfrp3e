import Selector from "./selector.mjs";

/** @inheritDoc */
export default class OriginSelector extends Selector
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "origin-selector-{id}",
		classes: ["origin-selector"],
		window: {title: "ORIGINSELECTOR.title"}
	};

	/** @inheritDoc */
	static PARTS = {
		main: {template: "systems/wfrp3e/templates/applications/apps/selectors/origin-selector/main.hbs"},
		introduction: {template: "systems/wfrp3e/templates/applications/apps/selectors/origin-selector/introduction.hbs"},
		selection: {template: "systems/wfrp3e/templates/applications/apps/selectors/origin-selector/selection.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/**
	 * The currently selected race.
	 * @type {string}
	 */
	race = null;

	/** @inheritDoc */
	type = "origin";

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "ORIGINSELECTOR.ACTIONS.chooseOrigin"}]
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "main":
				partContext = {
					...partContext,
					race: this.items[this.race],
					races: this.items
				};
				break;
			case "introduction":
				if(this.selection.length) {
					const origin = this.#getOrigin(),
						  enrichment = {};

					for(const ability of origin.abilities)
						enrichment[ability.uuid] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
							ability.system.description
						);

					partContext = {...partContext, origin, enrichment};
				}
				break;
			case "selection":
				partContext.origin = this.#getOrigin();
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	async _handleNewSelection(value, formConfig, event)
	{
		if(event.target.dataset.type === "race") {
			this.race = value;
			this.selection = [Object.keys(CONFIG.WFRP3e.availableRaces[value].origins)[0]];
		}
		else
			await super._handleNewSelection(value, formConfig, event);
	}

	/**
	 * Fetches the origin which name is in the selection.
	 * @returns {Object} The origin and its data.
	 * @private
	 */
	#getOrigin()
	{
		return this.items[this.race]?.origins[this.selection[0]];
	}

	/**
	 * Builds an array of races available during Character Creation.
	 * @returns {Object} An array of races.
	 */
	static async buildRaceList()
	{
		const races = foundry.utils.deepClone(CONFIG.WFRP3e.availableRaces);

		for(const race of Object.values(races))
			for(const origin of Object.values(race.origins))
				origin.abilities = await Promise.all(origin.abilities.map(async uuid => await fromUuid(uuid)));

		return races;
	}
}
