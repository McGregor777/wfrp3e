import WFRP3eActorSheet from "./WFRP3eActorSheet.js";

/** @inheritDoc */
export default class WFRP3eCharacterSheet extends WFRP3eActorSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {addBasicSkills: this.#addBasicSkills},
		classes: ["character"],
		position: {
			width: 992,
			height: 853
		}
	};

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/actors/character-sheet/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		attributes: {
			template: "systems/wfrp3e/templates/applications/actors/character-sheet/attributes.hbs",
			scrollable: [".table-body"]
		},
		careers: {
			template: "systems/wfrp3e/templates/applications/actors/character-sheet/careers.hbs",
			scrollable: [".item-container"]
		},
		talents: {
			template: "systems/wfrp3e/templates/applications/actors/talents.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		actions: {
			template: "systems/wfrp3e/templates/applications/actors/actions.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		effects: {
			template: "systems/wfrp3e/templates/applications/actors/effects.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		trappings: {template: "systems/wfrp3e/templates/applications/actors/trappings.hbs"},
		background: {template: "systems/wfrp3e/templates/applications/actors/character-sheet/background.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "attributes"},
				{id: "careers"},
				{id: "talents"},
				{id: "actions"},
				{id: "effects"},
				{id: "trappings"},
				{id: "background"}
			],
			initial: "attributes",
			labelPrefix: "CHARACTER.TABS"
		}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "attributes":
				partContext = {
					...partContext,
					characteristics: CONFIG.WFRP3e.characteristics,
					fields: this.actor.system.schema.fields,
					skills: this.actor.itemTypes.skill.sort((a, b) => a.name.localeCompare(b.name))
				};
				break;
			case "careers":
				const sortedCareers = this.actor.itemTypes.career.sort((a, b) => a.name.localeCompare(b.name));

				partContext = {
					...partContext,
					careers: sortedCareers,
					characteristics: CONFIG.WFRP3e.characteristics,
					fields: this.actor.system.schema.fields,
					tabs: this._prepareTabs(partId)
				};
				break;
			case "background":
				partContext = {
					...partContext,
					enriched: {
						campaignNotes: await foundry.applications.ux.TextEditor.enrichHTML(
							this.actor.system.background.campaignNotes
						),
						biography: await foundry.applications.ux.TextEditor.enrichHTML(
							this.actor.system.background.biography
						)
					},
					fields: this.actor.system.schema.fields.background.fields,
					system: this.actor.system.background
				};
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	_prepareTabs(group)
	{
		if(group === "sheet") {
			const tabs = super._prepareTabs(group);

			if(this.actor.itemTypes.career.length <= 0)
				tabs.careers.cssClass += " hidden";

			return tabs;
		}
		else if(group === "careers")
			return this.actor.itemTypes.career.reduce((tabs, career, index) => {
				let tab = {
					id: career.id,
					group: group,
					label: career.name
				};

				if(career.system.current)
					tab.icon = "fa fa-check";

				if(career.system.current || index === 0 && !this.actor.system.currentCareer) {
					tab = {
						...tab,
						active: true,
						cssClass: "active"
					};
				}

				tabs.push(tab);
				return tabs;
			}, []);
	}

	/** @inheritDoc */
	async _onRender(context, options)
	{
		await super._onRender(context, options);

		for(const element of this.element.querySelectorAll(".advance-checkbox"))
			element.addEventListener("change", this.#onAdvanceChange.bind(this, options));
	}

	/**
	 * Performs follow-up operations after changes on a Career advance checkbox.
	 * @param {Object} options
	 * @param {Event} event
	 * @returns {Promise<void>}
	 * @private
	 */
	async #onAdvanceChange(options, event)
	{
		event.preventDefault();

		const career = await this._getByUuid(event),
			  input = event.target,
			  value = Number(input.value),
			  advanceType = input.dataset.advanceType;

		if(value === 1 && input.defaultChecked
			&& (advanceType === "careerTransition" && foundry.utils.getProperty(career, `system.advances.careerTransition.cost`) === value
				|| advanceType === "nonCareer" && foundry.utils.getProperty(career, `system.advances.nonCareer.${input.dataset.index}.cost`) === value))
			await this.actor.removeAdvance(career, advanceType, input.dataset.index);
		// If the advance is a career transition or a non-career one, and its type is already set, checkboxes are used to define the advance's cost.
		else if(advanceType === "careerTransition" && foundry.utils.getProperty(career, `system.advances.careerTransition.newCareer`)
			|| advanceType === "nonCareer" && foundry.utils.getProperty(career, `system.advances.nonCareer.${input.dataset.index}.type`))
			await this._onItemInput(options, event);
		// Otherwise, the checkbox is either used to buy an advance, or to remove if it has been bought already.
		else if(input.defaultChecked)
			await this.actor.removeAdvance(career, advanceType, input.dataset.index);
		else {
			input.checked = false;
			await this.actor.buyAdvance(career, advanceType);
		}
	}

	/**
	 * Adds every basic skills to the Character.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #addBasicSkills()
	{
		await Item.createDocuments(
			await game.packs.get("wfrp3e.items").getDocuments({type: "skill", system: {advanced: false}}),
			{parent: this.actor}
		);
	}
}