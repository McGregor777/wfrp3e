import DataHelper from "../DataHelper.js";
import WFRP3eTrappingDataModel from "./WFRP3eTrappingDataModel.js";

/** @inheritDoc */
export default class WFRP3eWeaponDataModel extends WFRP3eTrappingDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return Object.assign({
			criticalRating: new fields.NumberField({initial: 5, integer: true, min: 0, nullable: false, required: true}),
			damageRating: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true}),
			group: new fields.StringField({initial: "ordinary", nullable: false, required: true}),
			qualities: new fields.ArrayField(
				new fields.SchemaField({
					name: new fields.StringField({initial: "attuned", nullable: false, required: true}),
					rating: new fields.NumberField({initial: 1, integer: true, min: 1})
				})
			),
			range: new fields.StringField({initial: "close", nullable: false, required: true}),
			special: new fields.HTMLField()
		}, super.defineSchema());
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareSpecialQualityDescription();
	}

	/**
	 * Prepares the description of the Weapon's special quality description.
	 * @private
	 */
	_prepareSpecialQualityDescription()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.special);

		if(cleanedUpDescription)
			this.updateSource({special: cleanedUpDescription});
	}
}