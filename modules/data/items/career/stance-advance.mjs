import CareerAdvance from "./career-advance.mjs";

/**
 * The data model for a stance advance.
 * @abstract
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 */
export default class StanceAdvance extends CareerAdvance
{
	static {
		Object.defineProperty(this, "TYPE", {value: "conservative"});
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const actor = career.parent.parent,
			  propertyPath = `system.stance.${this.TYPE}`;

		await actor.update({[`system.stance.${this.TYPE}`]: foundry.utils.getProperty(actor, propertyPath) + 1});

		return await super._operateChanges(career, index);
	}
}
