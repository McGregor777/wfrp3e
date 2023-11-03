import CheckHelper from "../CheckHelper.js";
import DicePool from "../DicePool.js";
import WFRP3eRoll from "../WFRP3eRoll.js";
import CheckBuilder from "../applications/CheckBuilder.js";

/**
 * Extends the base Combat entity.
 */
export default class WFRP3eCombat extends Combat
{
	/** @inheritDoc */
	async rollInitiative(ids, {formula = null, updateTurn = true, messageOptions = {}} = {})
	{
		// Make sure we are dealing with an array of ids
		if(!Array.isArray(ids))
			ids = typeof ids === "string" ? [ids] : ids;

		return await new CheckBuilder(new DicePool(),
			game.i18n.localize("ROLL.InitiativeCheck"),
			{combat: this, combatantIds: ids, updateTurn: updateTurn, messageOptions: messageOptions}
		).render(true);
	}
	/** @inheritDoc */
	_getInitiativeRoll(combatant, formula)
	{
		const initiativeDicePool = CheckHelper.prepareInitiativeCheck(
			combatant.actor,
			formula === "social" ? "fellowship" : "agility"
		);

		const initiativeRoll = new WFRP3eRoll(
			initiativeDicePool.renderDiceExpression(),
			initiativeDicePool,
			{data: combatant.actor ? combatant.actor.getRollData() : {}}
		).roll();

		const totalInitiative = initiativeRoll.symbols.successes;

		initiativeRoll._result = totalInitiative;
		initiativeRoll._total = totalInitiative;

		return initiativeRoll;
	}
}