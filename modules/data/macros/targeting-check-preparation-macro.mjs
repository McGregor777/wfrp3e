import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Targeting Check Preparation Macro for an Active Effect.
 * @property {string} script The script that is executed whenever a targeting check is being prepared.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class TargetingCheckPreparationMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "targetingCheckPreparation"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.targetingCheckPreparation", "EFFECT.MACROS"];
}
