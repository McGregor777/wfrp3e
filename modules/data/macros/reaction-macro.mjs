import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Reaction Macro for an Active Effect.
 * @property {string} script The script that is executed when a Reaction Action is selected.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 * @property {string} conditionalScript The script that determines whether the Active Effect Macro can be triggered.
 */
export default class ReactionMacro extends ActiveEffectMacro
{
	/**
	 * The default values for an active effect reaction macro.
	 * @returns {{conditionalScript: string, script: string, type: string}}
	 * @protected
	 */
	static get _defaults()
	{
		return Object.assign(super._defaults, {conditionalScript: ""});
	}

	static {
		Object.defineProperty(this, "TYPE", {value: "reaction"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.reaction", "EFFECT.MACROS"];

	/** @inheritdoc */
	static defineSchema()
	{
		return {
			...super.defineSchema(),
			conditionalScript: new foundry.data.fields.JavaScriptField()
		};
	}
}
