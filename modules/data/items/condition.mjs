import Item from "./item.mjs";

/** @inheritDoc */
export default class Condition extends Item
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			duration: new fields.StringField({
				choices: this.DURATIONS,
				initial: Object.keys(this.DURATIONS)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["CONDITION"];
	
	static DURATIONS = {
		brief: "CONDITION.DURATIONS.brief",
		dependent: "CONDITION.DURATIONS.dependent",
		lingering: "CONDITION.DURATIONS.lingering"
	};
}
