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

		if(partId === "main") {
			const enrichment = {};
			for(const career of this.items)
				enrichment[career.uuid] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
					career.system.description
				);

			partContext = {
				...partContext,
				characteristics: CONFIG.WFRP3e.characteristics,
				enrichment
			};
		}

		return partContext;
	}

	/**
	 * Builds an array of careers eligible for a transition.
	 * @param {WFRP3eActor} actor The actor changing career.
	 * @returns {Promise<WFRP3eItem[]>} An array of careers eligible for a transition.
	 */
	static async buildAdvanceOptionsList(actor)
	{
		const careers = [];
		for(const pack of game.packs.filter(pack => pack.documentName === "Item")) {
			const foundCareers = pack.getDocuments({type: "career"})
				.then(foundCareers => foundCareers.filter(career => career.name !== actor.system.currentCareer.name
						&& career.system.raceRestrictions.includes(actor.system.race.id)
						&& (!career.system.advanced || actor.system.rank > 1)));
			careers.push(...foundCareers);
		}

		return careers;
	}

	/**
	 * Builds an array of careers eligible for a new character.
	 * @param {WFRP3eActor} character The new character.
	 * @returns {Promise<WFRP3eItem[]>} An array of careers eligible for a new character.
	 */
	static async buildStartingCareerList(character)
	{
		const careers = [];
		for(const pack of game.packs.filter(pack => pack.documentName === "Item")) {
			const basicCareers = await pack.getDocuments({type: "career", system: {advanced: false}});

			careers.push(...basicCareers.filter(career => {
				return career.system.raceRestrictions.includes(character.system.race.id)
			}));
		}

		switch(game.settings.get("wfrp3e", "startingCareerDrawingMethod")) {
			case "drawThree":
				const drawnCareers = [];

				for(let i = 0; i < 3; i++)
					drawnCareers.push(careers[Math.floor(Math.random() * careers.length)]);

				return drawnCareers;

			case "rollTable":
				//#TODO Doesn't work
				return fromUuid(this.character.system.race.startingCareerRollTableUuid)
					.then(async rollTable => {
						return rollTable.draw({displayChat: false})
							//#TODO Check how TableResult allows to get a linked Document's UUID.
							.then(result => result.results.map(async result => await fromUuid(result.documentUuid)));
					});

			case "freeChoice":
				return careers;
		}
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
