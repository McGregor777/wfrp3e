import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Check Outcome Macro for an Active Effect.
 * @property {string} script The script that is executed during a check outcome calculation.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class CheckOutcomeMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "checkOutcome"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.checkOutcome", "EFFECT.MACROS"];
}
