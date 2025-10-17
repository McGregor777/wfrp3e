/** @inheritDoc */
export default class WFRP3eAbilityDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			cooldown: new fields.BooleanField(),
			description: new fields.HTMLField()
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["ABILITY"];
}
