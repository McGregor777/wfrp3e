import CareerAdvance from "./career-advance.mjs";

/**
 * The data model for a characteristic rating advance.
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 * @property {string} [characteristic] The name of the characteristic which rating is upgraded by the advance.
 */
export default class RatingAdvance extends CareerAdvance
{
	/**
	 * The default values for a rating advance.
	 * @returns {{active: false, type: "rating", characteristic: string}}
	 * @protected
	 */
	static get _defaults()
	{
		return Object.assign(super._defaults, {
			characteristic: Object.keys(wfrp3e.data.actors.Actor.CHARACTERISTICS)[0]
		});
	}

	static {
		Object.defineProperty(this, "TYPE", {value: "rating"});
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
		return this.active
			? game.i18n.format(`CAREER.ADVANCES.${this.type}.output`, {
				characteristic: game.i18n.localize(`ACTOR.FIELDS.characteristics.FIELDS.${this.characteristic}.label`)
			})
			: "";
	}

	/** @inheritDoc */
	static async buyAdvance(career, open)
	{
		await this.buyOpenAdvance(career);
	}

	/** @inheritDoc */
	static async buyRegularAdvance(career)
	{
		await this.buyOpenAdvance(career);
	}

	/** @inheritDoc */
	static async buyOpenAdvance(career)
	{
		const openAdvanceIndex = career.advances.open.findIndex(advance => !advance.active);
		if(openAdvanceIndex == null)
			return ui.notifications.warn("Unable to buy the advance: the career has no available open advance.");

		const openAdvances = career.simpleOpenAdvances,
			  changes = await this._operateChanges(career, openAdvanceIndex);

		if(changes.type === this.TYPE) {
			// Change as much open advance as the new characteristic rating value.
			const newRating = career.parent.parent.system.characteristics[changes.characteristic].rating;
			let advanceCount = 0;

			for(let index in openAdvances) {
				if(!openAdvances[index].active) {
					openAdvances[index] = changes;
					advanceCount++;
				}

				if(advanceCount >= newRating)
					break;
			}
		}
		else
			openAdvances[openAdvanceIndex] = changes;

		await career.parent.update({"system.advances.open": openAdvances});
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const actor = career.parent.parent,
			  upgrade = await wfrp3e.applications.apps.CharacteristicUpgrader.wait({actor, career: career.parent});

		const error = this._checkForError(career, {index, upgrade});
		if(error)
			return ui.notifications.error(error);

		await actor.update({[`system.characteristics.${upgrade.characteristic}.${upgrade.type}`]: upgrade.value});
		return {...await super._operateChanges(career, index), characteristic: upgrade.characteristic, type: upgrade.type};
	}

	/**
	 * Checks for any error before making definitive changes.
	 * @param {Career} career The career containing the advance.
	 * @param {Object} upgrade A characteristic upgrade.
	 * @param {number} index The index of the advance if it is an open one.
	 * @returns {string|false} Returns an error if any found, false otherwise.
	 */
	static _checkForError(career, {index = null, upgrade = null} = {})
	{
		// Check that there are enough free open advances to actually increase the characteristic rating.
		if(upgrade.type === this.TYPE) {
			const newRating = +upgrade.value;
			let advanceCount = 0;

			for(const advance of career.advances.open) {
				if(!advance.active)
					advanceCount++;

				if(advanceCount >= newRating)
					break;
			}

			if(advanceCount < newRating)
				return "CAREER.WARNINGS.notEnoughOpenAdvances";
		}

		return super._checkForError(career, {index});
	}

	/** @inheritDoc */
	async cancelChanges()
	{
		const actor = this.parent.parent.parent,
			  propertyPath = `system.characteristics.${this.characteristic}.${this.TYPE}`;

		await actor.update({[propertyPath]: +foundry.utils.getProperty(actor, propertyPath) - 1});
	}
}
