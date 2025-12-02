import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Check Preparation Macro for an Active Effect.
 * @property {string} script The script that is executed whenever a check is being prepared.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class CheckPreparationMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "checkPreparation"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.checkPreparation", "EFFECT.MACROS"];
}
