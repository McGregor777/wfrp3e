import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eMoneyDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;
		const requiredInteger = {integer: true, nullable: false, required: true};

		return {
			description: new fields.HTMLField(),
			quantity: new fields.NumberField({...requiredInteger, initial: 1, min: 0}),
			value: new fields.NumberField({...requiredInteger, initial: 1, min: 0})
		};
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDescription();
	}

	/**
	 * Prepares the description of the Money's description.
	 * @private
	 */
	_prepareDescription()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.description);

		if(cleanedUpDescription)
			this.updateSource({description: cleanedUpDescription});
	}
}