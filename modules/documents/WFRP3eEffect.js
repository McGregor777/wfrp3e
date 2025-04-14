export default class WFRP3eEffect extends ActiveEffect
{
	/**
	 * Triggers the WFRP3eEffect's script.
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
			await fn.call(this, ...parameters);
		}
		catch(error) {
			console.error(error);
		}
	}

	/**
	 * Checks an effect condition script.
	 * @param {Object} options
	 * @param {Object[]} [options.parameters]
	 * @param {string[]} [options.parameterNames]
	 * @returns {Promise<boolean>} The result of the condition script.
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