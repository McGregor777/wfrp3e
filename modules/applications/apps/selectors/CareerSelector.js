import AbstractSelector from "./AbstractSelector.js";

/** @inheritDoc */
export default class CareerSelector extends AbstractSelector
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "career-selector-{id}",
		actions: {flip: this.#flip},
		classes: ["career-selector"],
		window: {title: "CAREERSELECTOR.title"}
	};

	/** @inheritDoc */
	type = "career";

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "CAREERSELECTOR.ACTIONS.chooseCareer"}]
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partId === "main")
			partContext.characteristics = CONFIG.WFRP3e.characteristics;

		return partContext;
	}

	/**
	 * Builds an array of Careers eligible for a transition.
	 * @param {WFRP3eActor} actor The Actor changing career.
	 * @returns {Promise<WFRP3eItem[]>}
	 */
	static async buildAdvanceOptionsList(actor)
	{
		return game.packs.filter(pack => pack.documentName === "Item").reduce(async (careers, pack) => {
			return [
				...await careers,
				...await pack.getDocuments({type: "career"})
					.then(foundCareers => foundCareers
						.filter(career => career.name !== actor.system.currentCareer.name
							&& career.system.raceRestrictions.includes(actor.system.race.id)
							&& (!career.system.advanced || actor.system.rank > 1)))
			];
		}, []);
	}

	/**
	 * Switches between two faces of a Document.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #flip(event, target)
	{
		const itemElement = target.closest(".item"),
			  activeFace = itemElement.querySelector(".face.active"),
			  inactiveFace = itemElement.querySelector(".face:not(.active)");

		activeFace.classList.remove("active");
		inactiveFace.classList.add("active");
	}
}