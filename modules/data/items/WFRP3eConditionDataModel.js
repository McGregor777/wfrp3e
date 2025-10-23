import WFRP3eItemDataModel from "./WFRP3eItemDataModel.js";

/** @inheritDoc */
export default class WFRP3eConditionDataModel extends WFRP3eItemDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			duration: new fields.StringField({
				choices: CONFIG.WFRP3e.conditionDurations,
				initial: Object.keys(CONFIG.WFRP3e.conditionDurations)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["CONDITION"];
}
