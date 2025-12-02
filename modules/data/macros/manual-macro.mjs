import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Manual Macro for an Active Effect.
 * @property {string} script The script that is executed upon manual trigger.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class ManualMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "manual"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.manual", "EFFECT.MACROS"];
}
