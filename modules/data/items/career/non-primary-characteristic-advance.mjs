import NonCareerAdvance from "./non-career-advance.mjs";

/**
 * The data model for a non-primary characteristic rating advance.
 * @property {number} cost The cost of the non-career advance.
 * @property {string} type The type of career advance, a value in NonCareerAdvance.TYPES.
 * @property {string} [characteristic] The name of the characteristic which rating is upgraded by the advance.
 */
export default class NonPrimaryCharacteristicAdvance extends NonCareerAdvance
{
	/**
	 * The default values for a rating advance.
	 * @returns {{cost: 0, type: "nonPrimaryCharacteristic", characteristic: string}}
	 * @protected
	 */
	static get _defaults()
	{
		return Object.assign(super._defaults, {
			characteristic: Object.keys(wfrp3e.data.actors.Actor.CHARACTERISTICS)[0]
		});
	}

	static {
		Object.defineProperty(this, "TYPE", {value: "nonPrimaryCharacteristic"});
	}

	/** @inheritdoc */
	static defineSchema()
	{
		const characteristics = {};
		for(const [key, characteristic] of Object.entries(wfrp3e.data.actors.Actor.CHARACTERISTICS))
			characteristics[key] = characteristic.name;

		return {
			...super.defineSchema(),
			characteristic: new foundry.data.fields.StringField({
				choices: characteristics,
				initial: Object.keys(characteristics)[0],
				required: true
			})
		};
	}

	get output()
	{
		return this.cost
			? game.i18n.format(`CAREER.ADVANCES.${wfrp3e.data.items.career.RatingAdvance.TYPE}.output`, {
				characteristic: game.i18n.localize(`ACTOR.FIELDS.characteristics.FIELDS.${this.characteristic}.label`)
			})
			: "";
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const actor = career.parent.parent,
			  upgrade = await wfrp3e.applications.apps.CharacteristicUpgrader.wait({
				  actor,
				  career: career.parent,
				  nonCareerAdvance: true
			  });

		const error = this._checkForError(career, index);
		if(error)
			return ui.notifications.error(error);

		await actor.update({[`system.characteristics.${upgrade.characteristic}.${upgrade.type}`]: upgrade.value});
		return {
			...await super._operateChanges(career, index),
			cost: actor.system.characteristics[upgrade.characteristic].rating,
			characteristic: upgrade.characteristic,
			type: this.TYPE
		};
	}

	/** @inheritDoc */
	async cancelChanges()
	{
		const actor = this.parent.parent.parent,
			  propertyPath = `system.characteristics.${this.characteristic}.${this.TYPE}`;

		await actor.update({[propertyPath]: +foundry.utils.getProperty(actor, propertyPath) - 1});
	}
}
