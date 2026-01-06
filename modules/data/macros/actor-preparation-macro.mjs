import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for an Actor Preparation Macro for an Active Effect.
 * @property {string} script The script that is executed every time an Actor's data is being prepared.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class ActorPreparationMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "actorPreparation"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.actorPreparation", "EFFECT.MACROS"];
}
