import Item from "./item.mjs";

/** @inheritDoc */
export default class Talent extends Item
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField({textSearch: true}),
			rechargeTokens: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
			socket: new fields.StringField({nullable: true}),
			type: new fields.StringField({
				choices: this.TYPES,
				initial: Object.keys(this.TYPES)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["TALENT"];

	static TYPES = {
		focus: "TALENT.TYPES.focus",
		reputation: "TALENT.TYPES.reputation",
		tactic: "TALENT.TYPES.tactic",
		faith: "TALENT.TYPES.faith",
		order: "TALENT.TYPES.order",
		tricks: "TALENT.TYPES.tricks"
	};
}
