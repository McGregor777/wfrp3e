import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Fortune Refresh Macro for an Active Effect.
 * @property {string} script The script that is executed whenever the party of an Actor has its fortune refreshing.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class FortuneRefreshMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "fortuneRefresh"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.fortuneRefresh", "EFFECT.MACROS"];
}
