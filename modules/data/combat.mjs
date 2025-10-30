/** @inheritDoc */
export default class Combat extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  combatTypes = {};

		for(const [key, combatType] of Object.entries(CONFIG.WFRP3e.encounterTypes))
			combatTypes[key] = combatType.name;

		return {
			type: new fields.StringField({
				choices: combatTypes,
				initial: Object.keys(CONFIG.WFRP3e.encounterTypes)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["COMBAT"];
}
