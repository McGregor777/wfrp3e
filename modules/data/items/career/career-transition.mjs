/**
 * The data model for a career transition advance.
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance.
 * @property {string} [uuid] The uuid of the career into which the transition has been made through the advance.
 */
export default class CareerTransition extends foundry.abstract.DataModel
{
	/**
	 * The type of this advance.
	 * @type {string}
	 */
	static TYPE = "careerTransition";

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["CAREER"];

	/** @inheritdoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			active: new fields.BooleanField(),
			cost: new fields.NumberField({initial: 0, integer: true, min: 0, required: true}),
			uuid: new fields.DocumentUUIDField({
				type: "Item",
				// Accept undefined as a valid value since fromUuidSync() fails to properly fetch
				// an item embedded on an actor during document preparation.
				validate: value => ["career", undefined].includes(fromUuidSync(value)?.type),
				validationError: "must be a career"
			})
		};
	}

	get output()
	{
		return this.active ? fromUuidSync(this.uuid)?.name : "";
	}

	/**
	 * Asks the user for specific selection if needed, then activates the advance and operate the changes it implies.
	 * @param {Career} career The career containing the new advance.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async buyAdvance(career)
	{
		if(career.advances.careerTransition.active)
			return ui.notifications.error(`Unable to buy the ${this.TYPE} advance: it is already bought.`);

		const actor = career.parent.parent,
			  {CareerSelector} = wfrp3e.applications.apps.selectors,
			  selectedCareerUuids = await CareerSelector.wait({
				  actor,
				  items: await CareerSelector.buildAdvanceOptionsList(actor)
			  }),
			  selectedCareer = await fromUuid(selectedCareerUuids[0]);
		let cost = career.calculateCareerTransitionCost(selectedCareer);

		//TODO: Add Execute onCareerTransition scripts here.

		if(actor.system.experience.current < cost)
			return ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.notEnoughExperienceForAdvance"));

		const newCareers = await actor.createEmbeddedDocuments("Item", [selectedCareer]),
			  newCareer = newCareers[0];

		/** @see wfrp3e.documents.Item._onCareerUpdate */
		await newCareer.update({"system.current": true});
		await career.parent.update({"system.advances.careerTransition": {active: true, cost, uuid: newCareer.uuid}});
	}
}
