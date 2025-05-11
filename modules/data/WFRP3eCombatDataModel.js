/** @inheritDoc */
export default class WFRP3eCombatDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			type: new fields.StringField({
				choices: {
					...Object.entries(CONFIG.WFRP3e.encounterTypes).reduce((object, [key, group]) => {
						object[key] = group.name
						return object;
					}, {})
				},
				initial: Object.keys(CONFIG.WFRP3e.encounterTypes)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["COMBAT"];
}