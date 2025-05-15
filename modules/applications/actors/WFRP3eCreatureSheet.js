import WFRP3eActorSheet from "./WFRP3eActorSheet.js";

/** @inheritDoc */
export default class WFRP3eCreatureSheet extends WFRP3eActorSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {adjustStance: {handler: this.#adjustStance, buttons: [0, 2]}},
		classes: ["creature"],
		position: {
			width: 560,
			height: 870
		}
	};

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/actors/creature-sheet/header.hbs"},
		category: {template: "systems/wfrp3e/templates/applications/actors/creature-sheet/category.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		attributes: {
			template: "systems/wfrp3e/templates/applications/actors/creature-sheet/attributes.hbs",
			scrollable: [".table-body"]
		},
		actions: {
			template: "systems/wfrp3e/templates/applications/actors/actions.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		talents: {
			template: "systems/wfrp3e/templates/applications/actors/talents.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		effects: {
			template: "systems/wfrp3e/templates/applications/actors/effects.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		trappings: {template: "systems/wfrp3e/templates/applications/actors/trappings.hbs"},
		details: {template: "systems/wfrp3e/templates/applications/actors/creature-sheet/details.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "attributes"},
				{id: "actions"},
				{id: "talents"},
				{id: "effects"},
				{id: "trappings"},
				{id: "details"}
			],
			initial: "attributes",
			labelPrefix: "CREATURE.TABS"
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
					attributes: CONFIG.WFRP3e.attributes,
					characteristics: CONFIG.WFRP3e.characteristics,
					enriched: {
						specialRuleSummary: await foundry.applications.ux.TextEditor.enrichHTML(
							this.actor.system.specialRuleSummary
						)
					},
					fields: this.actor.system.schema.fields,
					skills: this.actor.itemTypes.skill.sort((a, b) => a.name.localeCompare(b.name))
				};
				break;
			case "category":
			case "details":
				partContext = {
					...partContext,
					enriched: {
						description: await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.description)
					},
					fields: this.actor.system.schema.fields
				};
				break;
		}

		return partContext;
	}

	/**
	 * Changes the current stance of the Creature.
	 * @param {PointerEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #adjustStance(event)
	{
		let amount = 0;

		switch(event.button) {
			case 0:
				amount = 1;
				break;
			case 2:
				amount = -1;
				break;
		}

		await this.actor.update({"system.stance.current": this.actor.system.stance.current + amount});
	}
}