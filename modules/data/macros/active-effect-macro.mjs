/**
 * A data model intended to be used as an inner EmbeddedDataField which defines an Active Effect Macro.
 * @abstract
 * @property {string} script The script that is executed upon trigger, which depends on the script type.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class ActiveEffectMacro extends foundry.abstract.DataModel
{
	/**
	 * The default values for an Active Effect Macro.
	 * @returns {{script: string, type: string}}
	 * @protected
	 */
	static get _defaults()
	{
		return {
			script: "",
			type: this.TYPES[wfrp3e.data.macros.ManualMacro.TYPE]
		};
	}

	/**
	 * The types of Active Effect Macros.
	 * @type {Readonly<{
	 *   actionUsage: ActionUsageMacro
	 *   careerSocket: CareerSocketMacro
	 *   careerTransition: CareerTransitionMacro
	 *   checkPreparation: CheckPreparationMacro
	 *   checkRoll: CheckRollMacro
	 *   creationPointInvestment: CreationPointInvestmentMacro
	 *   manualPostCheck: ManualPostCheckRollMacro
	 *   manualPreCheck: ManualPreCheckRollMacro
	 *   manual: ManualMacro
	 *   requirement: RequirementMacro
	 *   startingSkillTrainingSelection: StartingSkillTrainingSelectionMacro
	 *   startingTalentSelection: StartingTalentSelectionMacro
	 *   targetingCheckPreparation: TargetingCheckPreparationMacro
	 * }>}
	 */
	static get TYPES()
	{
		const {ActionUsageMacro, CareerSocketMacro, CareerTransitionMacro, CheckPreparationMacro, CheckRollMacro,
			   CreationPointInvestmentMacro, ManualMacro, ManualPostCheckRollMacro, ManualPreCheckRollMacro,
			   RequirementMacro, StartingSkillTrainingSelectionMacro, StartingTalentSelectionMacro,
			   TargetingCheckPreparationMacro} = wfrp3e.data.macros;

		return Object.freeze({
			[ActionUsageMacro.TYPE]: ActionUsageMacro,
			[CareerSocketMacro.TYPE]: CareerSocketMacro,
			[CareerTransitionMacro.TYPE]: CareerTransitionMacro,
			[CheckPreparationMacro.TYPE]: CheckPreparationMacro,
			[CheckRollMacro.TYPE]: CheckRollMacro,
			[CreationPointInvestmentMacro.TYPE]: CreationPointInvestmentMacro,
			[ManualPostCheckRollMacro.TYPE]: ManualPostCheckRollMacro,
			[ManualPreCheckRollMacro.TYPE]: ManualPreCheckRollMacro,
			[ManualMacro.TYPE]: ManualMacro,
			[RequirementMacro.TYPE]: RequirementMacro,
			[StartingSkillTrainingSelectionMacro.TYPE]: StartingSkillTrainingSelectionMacro,
			[StartingTalentSelectionMacro.TYPE]: StartingTalentSelectionMacro,
			[TargetingCheckPreparationMacro.TYPE]: TargetingCheckPreparationMacro
		});
	};

	/**
	 * The type of this active effect macro.
	 * @type {string}
	 */
	static TYPE = "macro";

	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  types = {};

		for(const key of Object.keys(this.TYPES))
			types[key] = `EFFECT.MACROS.${key}.label`;

		return {
			script: new fields.JavaScriptField({async: true}),
			type: new fields.StringField({
				choices: types,
				initial: this.TYPE,
				required: true
			})
		};
	}
}
