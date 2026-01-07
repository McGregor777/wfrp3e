import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Manual Pre-Check Roll Macro for an Active Effect.
 * @property {string} script The script that is executed upon manual trigger before a check roll.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 * @property {string} conditionalScript The script that determines whether the Active Effect Macro can be triggered.
 * @property {string} postRollScript The script that is executed once the check is rolled if the Active Effect was selected.
 */
export default class ManualPreCheckRollMacro extends ActiveEffectMacro
{
	/**
	 * The default values for an active effect manual post-check roll macro.
	 * @returns {{script: string, type: string, conditionalScript: string, postRollScript: string}}
	 * @protected
	 */
	static get _defaults()
	{
		return Object.assign(super._defaults, {conditionalScript: "", postRollScript: ""});
	}

	static {
		Object.defineProperty(this, "TYPE", {value: "manualPreCheckRoll"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.manualPreCheckRoll", "EFFECT.MACROS"];

	/** @inheritdoc */
	static defineSchema()
	{
		return {
			...super.defineSchema(),
			conditionalScript: new foundry.data.fields.JavaScriptField(),
			postRollScript: new foundry.data.fields.JavaScriptField({async: true})
		};
	}
}
