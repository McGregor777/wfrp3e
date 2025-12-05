import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Career Socket Macro for an Active Effect.
 * @property {string} script The script that is executed on a talent whenever it is socketed onto a career.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class CareerSocketMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "careerSocket"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.careerSocket", "EFFECT.MACROS"];
}
