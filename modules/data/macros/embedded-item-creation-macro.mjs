import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for an Embedded Item Creation Macro for an Active Effect.
 * @property {string} script The script that is executed whenever one or multiple embedded items are created for an Actor.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class EmbeddedItemCreationMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "embeddedItemCreation"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.embeddedItemCreation", "EFFECT.MACROS"];
}
