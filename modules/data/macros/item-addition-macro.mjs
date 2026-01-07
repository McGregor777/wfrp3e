import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for an Item Addition Macro for an Active Effect.
 * @property {string} script The script that is executed whenever this item is added to an Actor.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 */
export default class ItemAdditionMacro extends ActiveEffectMacro
{
	static {
		Object.defineProperty(this, "TYPE", {value: "itemAddition"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.itemAddition", "EFFECT.MACROS"];
}
