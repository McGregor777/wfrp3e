import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Stress Adjustment Macro for an Active Effect.
 * @property {string} script The script that is executed whenever stress is adjusted by the Actor.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class StressAdjustmentMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "stressAdjustment"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.stressAdjustment", "EFFECT.MACROS"];
}
