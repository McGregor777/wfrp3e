/** @includeDoc */
export default class RollTable extends foundry.documents.RollTable
{
	/** @inheritDoc */
	async draw({roll, recursive = true, results = [], displayChat = true, rollMode} = {})
	{
		const drawnResult = await super.draw({roll, recursive, results, displayChat, rollMode});

		if(!displayChat)
			await this._executeDrawnScripts(drawnResult, {roll, results, recursive, displayChat, rollMode});

		return drawnResult;
	}
	/** @inheritDoc */
	async drawMany(number, {roll, recursive = true, displayChat = true, rollMode} = {})
	{
		let drawnResult = await super.drawMany(number, {roll, recursive, displayChat, rollMode});

		if(!displayChat)
			await this._executeDrawnScripts(drawnResult, {roll, recursive, displayChat, rollMode});

		return drawnResult;
	}

	/**
	 * Executes the Macros obtained from previously drawn results, then add the results to the originally drawn results.
	 * @param {RollTableDraw} drawnResult The previous drawn results to complete.
	 * @param {object} [options={}] Optional arguments which customise the draw behaviour.
	 * @param {Roll} [options.roll] An existing Roll instance to use for drawing from the table.
	 * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results.
	 * @param {TableResult[]} [options.results] One or more table results which have been drawn.
	 * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat.
	 * @param {string} [options.rollMode] The chat roll mode to use when displaying the result.
	 * @returns {Promise<{RollTableDraw}>}  A Promise which resolves to an object containing the executed roll and the
	 *                                      produced results.
	 * @protected
	 */
	async _executeDrawnScripts(drawnResult, {roll, recursive = true, results = [], displayChat = true, rollMode} = {})
	{
		const scriptRolls = [], scriptResults = [];

		for(const result of drawnResult.results) {
			const doc = await fromUuid(result.documentUuid);
			if(doc?.type === "script") {
				const scriptResult = await doc.execute({
					roll,
					recursive,
					results,
					displayChat,
					rollMode,
					rollTable: this
				});

				scriptRolls.push(scriptResult.roll);
				scriptResults.push(...scriptResult.results);
			}
		}

		if(scriptRolls.length) {
			const rolls = drawnResult.roll ? [drawnResult.roll, ...scriptRolls] : scriptRolls;

			if(rolls.length) {
				// Construct a Roll object using the constructed pool.
				const pool = CONFIG.Dice.termTypes.PoolTerm.fromRolls(rolls);
				drawnResult.roll = Roll.defaultImplementation.fromTerms([pool]);
			}
		}

		if(scriptResults.length)
			drawnResult.results = drawnResult.results.concat(scriptResults);

		return drawnResult;
	}
}
