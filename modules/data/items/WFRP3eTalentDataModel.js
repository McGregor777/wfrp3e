import WFRP3eItemDataModel from "./WFRP3eItemDataModel.js";

/** @inheritDoc */
export default class WFRP3eTalentDataModel extends WFRP3eItemDataModel
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
				choices: CONFIG.WFRP3e.talentTypes,
				initial: Object.keys(CONFIG.WFRP3e.talentTypes)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["TALENT"];
}
