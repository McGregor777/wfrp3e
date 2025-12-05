import CareerAdvance from "./career-advance.mjs";

/**
 * The data model for a talent advance.
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 * @property {string} [uuid] The uuid of the talent acquired through the advance.
 */
export default class TalentAdvance extends CareerAdvance
{
	/**
	 * The default values for a talent advance.
	 * @returns {{active: false, type: "talent", uuid: null}}
	 * @protected
	 */
	static get _defaults()
	{
		return Object.assign(super._defaults, {uuid: null});
	}

	static {
		Object.defineProperty(this, "TYPE", {value: "talent"});
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
		return this.active
			? game.i18n.format(`CAREER.ADVANCES.${this.type}.output`, {talent: fromUuidSync(this.uuid)?.name})
			: "";
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const {TalentSelector} = wfrp3e.applications.apps.selectors,
			  actor = career.parent.parent,
			  selectedTalentUuids = await TalentSelector.wait({
				  items: await TalentSelector.buildAdvanceOptionsList(actor, career.parent)
			  });

		const error = this._checkForError(career, {index});
		if(error)
			return ui.notifications.error(error);

		const talents = await actor.createEmbeddedDocuments("Item", [await fromUuid(selectedTalentUuids[0])]);
		return {...await super._operateChanges(career, index), uuid: talents[0].uuid};
	}

	/** @inheritDoc */
	async cancelChanges()
	{
		try {
			await this.parent.parent.parent.deleteEmbeddedDocuments("Item", [foundry.utils.parseUuid(this.uuid).id]);
		}
		catch(error) {
			ui.notifications.error(error);
		}
	}
}
