import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Wound Adjustment Macro for an Active Effect.
 * @property {string} script The script that is executed whenever wounds are adjusted for the Actor.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class WoundsAdjustmentMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "woundsAdjustment"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.woundsAdjustment", "EFFECT.MACROS"];
}
