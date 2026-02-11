import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Damage Infliction Macro for an Active Effect.
 * @property {string} script The script that is executed whenever damages are about to be inflicted to the Actor.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class DamageInflictionMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "damageInfliction"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.damageInfliction", "EFFECT.MACROS"];
}
