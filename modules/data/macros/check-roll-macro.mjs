import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Check Roll Macro for an Active Effect.
 * @property {string} script The script that is executed whenever a check is rolled.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class CheckRollMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "checkRoll"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.checkRoll", "EFFECT.MACROS"];
}
