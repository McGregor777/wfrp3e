/** @inheritDoc */
export default class ActiveEffect extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const {ActiveEffectMacro, ManualMacro} = wfrp3e.data.macros;
		const fields = foundry.data.fields;

		return {
			macro: new foundry.data.fields.TypedSchemaField(ActiveEffectMacro.TYPES, {initial: new ManualMacro()})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["EFFECT"];

	/** @inheritDoc */
	static migrateData(source)
	{
		if(source.type === "onTargettingCheckPreparation")
			source.type = "onTargetingCheckPreparation";

		if(!source.macro) {
			source.macro = {
				script: source.script,
				conditionalScript: source.conditionScript,
				postRollScript: source.postScript
			};

			const {CareerSocketMacro, CareerTransitionMacro, CheckPreparationMacro, CheckRollMacro,
				  CreationPointInvestmentMacro, ManualMacro, ManualPostCheckRollMacro, ManualPreCheckRollMacro,
				  StartingSkillTrainingSelectionMacro, StartingTalentSelectionMacro, TargetingCheckPreparationMacro,
				  RequirementMacro} = wfrp3e.data.macros;

			switch(source.type) {
				case "onCareerSocket":
					source.macro.type = CareerSocketMacro.TYPE;
					break;
				case "onCareerTransition":
					source.macro.type = CareerTransitionMacro.TYPE;
					break;
				case "onCheckPreparation":
					source.macro.type = CheckPreparationMacro.TYPE;
					break;
				case "onCheckRoll":
					source.macro.type = CheckRollMacro.TYPE;
					break;
				case "onCreationPointInvestment":
					source.macro.type = CreationPointInvestmentMacro.TYPE;
					break;
				case "onPostCheckTrigger":
					source.macro.type = ManualPostCheckRollMacro.TYPE;
					break;
				case "onPreCheckTrigger":
					source.macro.type = ManualPreCheckRollMacro.TYPE;
					break;
				case "onStartingSkillTrainingSelection":
					source.macro.type = StartingSkillTrainingSelectionMacro.TYPE;
					break;
				case "onStartingTalentSelection":
					source.macro.type = StartingTalentSelectionMacro.TYPE;
					break;
				case "onTargetingCheckPreparation":
					source.macro.type = TargetingCheckPreparationMacro.TYPE;
					break;
				case "onTrigger":
					source.macro.type = ManualMacro.TYPE;
					break;
				case "requirementCheck":
					source.macro.type = RequirementMacro.TYPE;
					break;
			}
		}

		return super.migrateData(source);
	}
}
