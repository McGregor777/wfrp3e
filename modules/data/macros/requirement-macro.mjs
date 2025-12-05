import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Requirement Macro for an Active effect.
 * @property {string} script The script that is executed to verify whether requirements are met prior to a selection building.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class RequirementMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "requirement"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.requirement", "EFFECT.MACROS"];
}
