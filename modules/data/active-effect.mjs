/** @inheritDoc */
export default class ActiveEffect extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			conditionScript: new fields.JavaScriptField(),
			postScript: new fields.JavaScriptField({async: true}),
			reverseScript: new fields.JavaScriptField({async: true}),
			script: new fields.JavaScriptField({async: true}),
			type: new fields.StringField({
				choices: this.SCRIPT_TYPES,
				initial: Object.keys(this.SCRIPT_TYPES)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["EFFECT"];

	static SCRIPT_TYPES = {
		onCareerSocket: "SCRIPT.TYPES.onCareerSocket",
		onCareerTransition: "SCRIPT.TYPES.onCareerTransition",
		onCheckPreparation: "SCRIPT.TYPES.onCheckPreparation",
		onCheckRoll: "SCRIPT.TYPES.onCheckRoll",
		onCreationPointInvestment: "SCRIPT.TYPES.onCreationPointInvestment",
		onPostCheckTrigger: "SCRIPT.TYPES.onPostCheckTrigger",
		onPreCheckTrigger: "SCRIPT.TYPES.onPreCheckTrigger",
		onStartingSkillTrainingSelection: "SCRIPT.TYPES.onStartingSkillTrainingSelection",
		onStartingTalentSelection: "SCRIPT.TYPES.onStartingTalentSelection",
		onTargetingCheckPreparation: "SCRIPT.TYPES.onTargetingCheckPreparation",
		onTrigger: "SCRIPT.TYPES.onTrigger",
		requirementCheck: "SCRIPT.TYPES.requirementCheck"
	};

	/** @inheritDoc */
	static migrateData(source)
	{
		if(source.type === "onTargettingCheckPreparation")
			source.type = "onTargetingCheckPreparation";

		return super.migrateData(source);
	}
}
