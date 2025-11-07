import CareerAdvance from "./career-advance.mjs";

/**
 * The data model for a wound advance.
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 */
export default class WoundAdvance extends CareerAdvance
{
	static {
		Object.defineProperty(this, "TYPE", {value: "wound"});
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const actor = career.parent.parent,
			  propertyPath = "system.wounds",
			  wounds =  foundry.utils.getProperty(actor, propertyPath),
			  changes = {[propertyPath]: {max: actor.system.wounds.max + 1}};

		if(wounds.value === wounds.max)
			changes[propertyPath].value = changes[propertyPath].max;

		await actor.update(changes);
		return await super._operateChanges(career, index);
	}
}
