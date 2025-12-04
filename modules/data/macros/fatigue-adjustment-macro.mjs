import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Fatigue Adjustment Macro for an Active Effect.
 * @property {string} script The script that is executed whenever fatigue is adjusted by the Actor.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class FatigueAdjustmentMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "fatigueAdjustment"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.fatigueAdjustment", "EFFECT.MACROS"];
}
