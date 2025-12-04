import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Power Favour Adjustment Macro for an Active Effect.
 * @property {string} script The script that is executed whenever power or favour is adjusted for the Actor.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class PowerFavourAdjustmentMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "powerFavourAdjustment"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.powerFavourAdjustment", "EFFECT.MACROS"];
}
