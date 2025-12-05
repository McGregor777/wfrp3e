import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Starting Skill Training Selection Macro for an Active Effect.
 * @property {string} script The script executed after starting skill trainings has been selected during character creation.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class StartingSkillTrainingSelectionMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "startingSkillTrainingSelection"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.startingSkillTrainingSelection", "EFFECT.MACROS"];
}
