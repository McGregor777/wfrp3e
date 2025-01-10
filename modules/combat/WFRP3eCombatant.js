import CheckBuilderV2 from "../applications/CheckBuilderV2.js";

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
			|| CheckBuilderV2.prepareInitiativeCheck(this.actor, this.combat).formula
		);
	}
}