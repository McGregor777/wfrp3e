export default class ActiveEffect extends foundry.documents.ActiveEffect
{
	/**
	 * Triggers the script of the active effect.
	 * @param {Object} options
	 * @param {Object[]} [options.parameters]
	 * @param {string[]} [options.parameterNames]
	 * @param {string} [options.script]
	 * @returns {Promise<void>}
	 */
	async triggerEffect({parameters = [], parameterNames = [], script = "script"} = {})
	{
		try {
			const fn = new foundry.utils.AsyncFunction(...parameterNames, this.system[script]);
			return await fn.call(this, ...parameters);
		}
		catch(error) {
			console.error(error);
		}
	}

	/**
	 * Checks the condition script of the active effect.
	 * @param {Object} options
	 * @param {Object[]} [options.parameters]
	 * @param {string[]} [options.parameterNames]
	 * @returns {Promise<boolean>} Whether the condition script was passed.
	 * @private
	 */
	checkEffectConditionScript({parameters = [], parameterNames = []} = {})
	{
		try {
			const fn = new Function(...parameterNames, this.system.conditionScript);
			return fn.call(this, ...parameters);
		}
		catch(error) {
			console.error(error);
		}
	}
}
