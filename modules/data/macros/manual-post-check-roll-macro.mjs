import ActiveEffectMacro from "./active-effect-macro.mjs";

/**
 * The data model for a Manual Post-Check Roll Macro for an Active Effect.
 * @property {string} script The script that is executed upon manual trigger after a check roll.
 * @property {string} type The type of Active Effect Macro, a value in ActiveEffectMacro.TYPES.
 * @property {string} conditionalScript The script that determines whether the Active Effect Macro can be triggered.
 */
export default class ManualPostCheckRollMacro extends ActiveEffectMacro
{
	/**
	 * The default values for an active effect manual post-check roll macro.
	 * @returns {{conditionalScript: string, script: string, type: string}}
	 * @protected
	 */
	static get _defaults()
	{
		return Object.assign(super._defaults, {conditionalScript: ""});
	}

	static {
		Object.defineProperty(this, "TYPE", {value: "manualPostCheckRoll"});
	}

	/** @override */
	static LOCALIZATION_PREFIXES = ["EFFECT.MACROS.manualPostCheckRoll", "EFFECT.MACROS"];

	/** @inheritdoc */
	static defineSchema()
	{
		return {
			...super.defineSchema(),
			conditionalScript: new foundry.data.fields.JavaScriptField()
		};
	}
}
