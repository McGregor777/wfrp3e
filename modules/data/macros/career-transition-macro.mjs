import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Career Transition Macro for an Active Effect.
 * @property {string} script The script that is executed on a career once it is set as the current career of an Actor.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class CareerTransitionMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "careerTransition"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.careerTransition", "EFFECT.MACROS"];
}
