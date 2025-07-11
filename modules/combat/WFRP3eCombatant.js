import CheckBuilder from "../applications/CheckBuilder.js";

/**
 * Extends the base Combatant document.
 */
export default class WFRP3eCombatant extends Combatant
{
	/** @inheritDoc */
	async getInitiativeRoll(formula) {
		formula = formula || await this._getInitiativeFormula();

		const rollData = this.actor?.getRollData() || {};

		return foundry.dice.Roll.create(formula, rollData);
	}

	/** @inheritDoc */
	async rollInitiative(formula) {
		const roll = await this.getInitiativeRoll(formula);

		await roll.evaluate();

		return this.update({initiative: roll.total});
	}

	/** @inheritDoc */
	async _getInitiativeFormula()
	{
		return String(
			CONFIG.Combat.initiative.formula
			|| game.system.initiative
			|| (await CheckBuilder.prepareInitiativeCheck(this.actor, this.combat)).formula
		);
	}
}