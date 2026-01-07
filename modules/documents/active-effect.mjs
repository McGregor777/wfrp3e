export default class ActiveEffect extends foundry.documents.ActiveEffect
{
	/**
	 * Triggers the script of the Active Effect Macro.
	 * @param {Object} [parameters] The parameters passed to the script.
	 * @param {string} [script] Which script is executed.
	 * @returns {Promise<any>}
	 */
	async triggerMacro(parameters = {}, script = "script")
	{
		try {
			const fn = new foundry.utils.AsyncFunction(...Object.keys(parameters), this.system.macro[script]);
			return await fn.call(this, ...Object.values(parameters));
		}
		catch(error) {
			ui.notifications.error(`Unable to execute the effect of ${this.name}: ${error}`);
		}
	}

	/**
	 * Checks the conditional script of the Active Effect.
	 * @param {Object} [parameters] The parameters passed to the conditional script.
	 * @returns {boolean} Whether the conditional script was passed.
	 */
	checkConditionalScript(parameters = {})
	{
		if(!this.system.macro.conditionalScript)
			return true;

		try {
			const fn = new Function(...Object.keys(parameters), this.system.macro.conditionalScript);
			return fn.call(this, ...Object.values(parameters));
		}
		catch(error) {
			ui.notifications.error(`Unable to execute the condition script of ${this.name}: ${error}`);
		}
	}
}
