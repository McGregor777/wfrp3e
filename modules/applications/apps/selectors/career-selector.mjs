import Selector from "./selector.mjs";

/** @inheritDoc */
export default class CareerSelector extends Selector
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
	 * @param {Actor} actor The actor changing career.
	 * @returns {Promise<Item[]>} An array of careers eligible for a transition.
	 */
	static async buildAdvanceOptionsList(actor)
	{
		const careers = [];

		for(const pack of game.packs)
			if(pack.documentName === "Item") {
				for(const career of await pack.getDocuments({type: "career"}))
					if(career.name !== actor.system.currentCareer.name
						&& career.system.raceRestrictions.includes(actor.system.race.id)
						&& (!career.system.advanced || actor.system.rank > 1))
						careers.push(career);
			}

		return careers;
	}

	/**
	 * Builds an array of careers eligible for a new character.
	 * @param {Actor} character The new character.
	 * @returns {Promise<Item[]>} An array of careers eligible for a new character.
	 */
	static async buildStartingCareerList(character)
	{
		let drawnCareers = [];

		switch(game.settings.get("wfrp3e", "startingCareerDrawingMethod")) {
			case "drawThree":
				const careers = await CareerSelector.#getBasicCareerList(character);
				for(let i = 0; i < 3; i++)
					drawnCareers.push(careers[Math.floor(Math.random() * careers.length)]);
				break;

			case "rollTable":
				const rollTable = await fromUuid(character.system.race.startingCareerRollTableUuid),
					  drawnResult = await rollTable.draw({displayChat: false});

				// If Dice So Nice! module is enabled, show the roll.
				game.dice3d?.showForRoll(drawnResult.roll);
				for(const result of drawnResult.results) {
					// "Choose any career you are eligible for" has been drawn, every basic career are available.
					if(result.type === "text") {
						await foundry.applications.api.DialogV2.prompt({
							content: "CAREERSELECTOR.DIALOG.chooseAnyCareer.description",
							window: {title: "CAREERSELECTOR.DIALOG.chooseAnyCareer.title"}
						})

						return await CareerSelector.#getBasicCareerList(character);
					}

					const doc = await fromUuid(result.documentUuid);
					if(doc.type === "career")
						drawnCareers.push(doc);

					if(drawnCareers.length > 1)
						await foundry.applications.api.DialogV2.prompt({
							content: "CAREERSELECTOR.DIALOG.moreThanOneCareer.description",
							window: {title: "CAREERSELECTOR.DIALOG.moreThanOneCareer.title"}
						})
				}
				break;

			case "freeChoice":
				return await CareerSelector.#getBasicCareerList(character);
		}

		return drawnCareers;
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

	/**
	 * Get a list of every basic career available as a starting career for a new character.
	 * @param {Actor} character The new character.
	 * @returns {Promise<Item[]>} An array of basic careers eligible as a starting career for a new character.
	 */
	static async #getBasicCareerList(character)
	{
		const basicCareers = [];

		for(const pack of game.packs)
			if(pack.documentName === "Item")
				for(const basicCareer of await pack.getDocuments({type: "career", system: {advanced: false}}))
					if(basicCareer.system.raceRestrictions.includes(character.system.race.id))
						basicCareers.push(basicCareer);

		return basicCareers;
	}
}
