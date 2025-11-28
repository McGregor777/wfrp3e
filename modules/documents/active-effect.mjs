export default class ActiveEffect extends foundry.documents.ActiveEffect
{
	/**
	 * Triggers the script of the active effect.
	 * @param {Object} [parameters] The parameters passed to the script.
	 * @param {string} [script] Which script is executed.
	 * @returns {Promise<any>}
	 */
	async triggerEffect(parameters = {}, script = "script")
	{
		try {
			const fn = new foundry.utils.AsyncFunction(...Object.keys(parameters), this.system[script]);
			return await fn.call(this, ...Object.values(parameters));
		}
		catch(error) {
			ui.notifications.error(`Unable to execute the effect of ${this.name}: ${error}`);
		}
	}

	/**
	 * Checks the condition script of the active effect.
	 * @param {Object} [parameters] The parameters passed to the condition script.
	 * @returns {boolean} Whether the condition script was passed.
	 */
	checkConditionScript(parameters = {})
	{
		if(!this.system.conditionScript)
			return true;

		try {
			const fn = new Function(...Object.keys(parameters), this.system.conditionScript);
			return fn.call(this, ...Object.values(parameters));
		}
		catch(error) {
			ui.notifications.error(`Unable to execute the condition script of ${this.name}: ${error}`);
		}
	}
}
