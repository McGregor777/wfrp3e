import CheckHelper from "../CheckHelper.js";

/**
 * Extends the base Combatant document.
 */
export default class WFRP3eCombatant extends Combatant
{
	/** @inheritDoc */
	_getInitiativeFormula()
	{
		return String(
			CONFIG.Combat.initiative.formula
			|| game.system.initiative
			|| CheckHelper.prepareInitiativeCheck(this.actor, this.combat).formula
		);
	}
}