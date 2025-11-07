import NonCareerAdvance from "./non-career-advance.mjs";

/**
 * The data model for a non-career talent advance.
 * @property {number} cost The cost of the non-career advance.
 * @property {string} type The type of career advance, a value in NonCareerAdvance.TYPES.
 * @property {string} [uuid] The uuid of the talent acquired through the advance.
 */
export default class NonCareerTalentAdvance extends NonCareerAdvance
{
	static {
		Object.defineProperty(this, "TYPE", {value: "nonCareerTalent"});
	}

	/** @inheritdoc */
	static defineSchema()
	{
		return {
			...super.defineSchema(),
			uuid: new foundry.data.fields.DocumentUUIDField({
				type: "Item",
				// Accept undefined as a valid value since fromUuidSync() fails to properly fetch an item embedded on an actor
				// during document preparation.
				validate: value => ["talent", undefined].includes(fromUuidSync(value)?.type),
				validationError: "must be a talent"
			})
		};
	}

	get output()
	{
		return this.cost
			? game.i18n.format(`CAREER.ADVANCES.${wfrp3e.data.items.career.TalentAdvance.TYPE}.output`, {
				talent: fromUuidSync(this.uuid)?.name
			})
			: "";
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const {TalentSelector} = wfrp3e.applications.apps.selectors,
			  actor = career.parent.parent,
			  selectedTalentUuids = await TalentSelector.wait({
				  items: await TalentSelector.buildAdvanceOptionsList(actor, career.parent, true)
			  });

		const error = this._checkForError(career, index);
		if(error)
			return ui.notifications.error(error);

		const talents = await actor.createEmbeddedDocuments("Item", [await fromUuid(selectedTalentUuids[0])]);
		return {...await super._operateChanges(career, index), uuid: talents[0].uuid};
	}
}
