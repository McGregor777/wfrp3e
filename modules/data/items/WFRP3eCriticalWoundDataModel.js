/** @inheritDoc */
export default class WFRP3eCriticalWoundDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			severityRating: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1})
		};
	}
}