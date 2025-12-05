import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Starting Talent Selection Macro for an Active Effect.
 * @property {string} script The script executed after starting talents has been selected during character creation.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class StartingTalentSelectionMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "startingTalentSelection"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.startingTalentSelection", "EFFECT.MACROS"];
}
