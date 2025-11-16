import ActorSheet from "./actor-sheet.mjs";

/** @inheritDoc */
export default class CharacterSheet extends ActorSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {addBasicSkills: this.#addBasicSkills},
		classes: ["character"],
		position: {
			width: 992,
			height: 853
		},
		window: {resizable: true}
	};

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/sheets/actors/character-sheet/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		attributes: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/character-sheet/attributes.hbs",
			scrollable: [".table-body"]
		},
		careers: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/character-sheet/careers.hbs",
			scrollable: ["div.career.item"]
		},
		talents: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/talents.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		actions: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/actions.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		effects: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/effects.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		trappings: {template: "systems/wfrp3e/templates/applications/sheets/actors/trappings.hbs"},
		background: {template: "systems/wfrp3e/templates/applications/sheets/actors/character-sheet/background.hbs"}
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
		const textEditor = foundry.applications.ux.TextEditor;
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "attributes":
				partContext = {
					...partContext,
					characteristics: wfrp3e.data.actors.Actor.CHARACTERISTICS,
					fields: this.actor.system.schema.fields,
					skills: this.actor.itemTypes.skill.sort((a, b) => a.name.localeCompare(b.name))
				};
				break;
			case "careers":
				const careers = this.actor.itemTypes.career.sort((a, b) => a.name.localeCompare(b.name)),
					  enrichment = {};

				for(const career of careers)
					enrichment[career.uuid] = await textEditor.enrichHTML(career.system.description);

				partContext = {
					...partContext,
					careers,
					characteristics: wfrp3e.data.actors.Actor.CHARACTERISTICS,
					enrichment,
					fields: this.actor.system.schema.fields,
					tabs: this._prepareTabs(partId)
				};
				break;
			case "background":
				partContext = {
					...partContext,
					enriched: {
						campaignNotes: await textEditor.enrichHTML(this.actor.system.background.campaignNotes),
						biography: await textEditor.enrichHTML(this.actor.system.background.biography)
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
		let tabs = [];
		if(group === "sheet") {
			tabs = super._prepareTabs(group);

			if(this.actor.itemTypes.career.length <= 0)
				tabs.careers.cssClass += " hidden";
		}
		else if(group === "careers") {
			for(const index in this.actor.itemTypes.career) {
				const career = this.actor.itemTypes.career[index];
				let tab = {
					id: career.id,
					group,
					label: career.name
				};

				if(career.system.current)
					tab.icon = "fa fa-check";

				if(career.system.current || !this.actor.system.currentCareer && index === 0)
					tab = {
						...tab,
						active: true,
						cssClass: "active"
					};

				tabs.push(tab);
			}
		}

		return tabs;
	}

	/** @inheritDoc */
	async _onRender(context, options)
	{
		await super._onRender(context, options);

		for(const element of this.element.querySelectorAll('input[type="checkbox"][name^="system.advances."]')) {
			element.removeEventListener("change", element.changeListener);
			element.addEventListener("change", this.#onAdvanceCheckboxChange.bind(this, options));
		}
	}

	/**
	 * Performs follow-up operations after changes on a career advance checkbox.
	 * @param {RenderOptions} options Provided render options.
	 * @param {Event} event The triggering event.
	 * @returns {Promise<void>}
	 * @private
	 */
	async #onAdvanceCheckboxChange(options, event)
	{
		event.preventDefault();

		const career = this.actor.items.get(event.target.closest("[data-item-id]").dataset.itemId),
			  input = event.target;

		if(input.defaultChecked) {
			const matches = input.name.match(new RegExp(/^(system.advances.\w+).?(\d+)?/)),
				  advance = foundry.utils.getProperty(career, matches[1]);
			await advance.cancelAdvance(matches[2]);
		}
		else {
			const matches = input.name.match(new RegExp(/^system.advances.(\w+)/)),
				  advanceType = matches[1];

			input.checked = false;
			await career.system.buyAdvance(advanceType);
		}
	}

	//#TODO Move the logic of this method to the actor document class.
	/**
	 * Adds every basic skill to the Character.
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
