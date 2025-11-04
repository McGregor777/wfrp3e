/** @inheritDoc */
export default class Combat extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  combatTypes = {};

		for(const [key, combatType] of Object.entries(this.TYPES))
			combatTypes[key] = combatType.name;

		return {
			type: new fields.StringField({
				choices: combatTypes,
				initial: Object.keys(this.TYPES)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["COMBAT"];

	static TYPES = {
		combat: {
			characteristic: "agility",
			name: "COMBAT.TYPES.combat"
		},
		social: {
			characteristic: "fellowship",
			name: "COMBAT.TYPES.social"
		}
	};
}
