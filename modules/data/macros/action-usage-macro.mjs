import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for an Action Usage Macro for an Active Effect.
 * @property {string} script The script that is executed whenever an Action is used, either after a check roll or a simple activation.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class ActionUsageMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "actionUsage"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.actionUsage", "EFFECT.MACROS"];
}
