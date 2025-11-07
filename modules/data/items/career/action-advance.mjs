import CareerAdvance from "./career-advance.mjs";

/**
 * The data model for an action advance.
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 * @property {string} [uuid] The uuid of the action card acquired through the advance.
 */
export default class ActionAdvance extends CareerAdvance
{
	static {
		Object.defineProperty(this, "TYPE", {value: "action"});
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
				validate: value => ["action", undefined].includes(fromUuidSync(value)?.type),
				validationError: "must be an action"
			})
		};
	}

	get output()
	{
		return this.active
			? game.i18n.format(`CAREER.ADVANCES.${this.type}.output`, {action: fromUuidSync(this.uuid)?.name})
			: "";
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const {ActionSelector} = wfrp3e.applications.apps.selectors,
			  actor = career.parent.parent,
			  selectedActionUuids = await ActionSelector.wait({items: await ActionSelector.buildOptionsList(actor)});

		const error = this._checkForError(career, {index});
		if(error)
			return ui.notifications.error(error);

		const actions = await actor.createEmbeddedDocuments("Item", [await fromUuid(selectedActionUuids[0])]);
		return {...await super._operateChanges(career, index), uuid: actions[0].uuid};
	}
}
