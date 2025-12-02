import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Creation Point Investment Macro for an Active Effect.
 * @property {string} script The script that is executed once the creation point investment has been made during a character creation.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class CreationPointInvestmentMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "creationPointInvestment"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.creationPointInvestment", "EFFECT.MACROS"];
}
