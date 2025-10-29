/**
 * Extends the base Combatant document.
 */
export default class Combatant extends foundry.documents.Combatant
{
	/** @inheritDoc */
	async getInitiativeRoll(formula) {
		formula = formula || await this._getInitiativeFormula();

		const rollData = this.actor?.getRollData() || {};

		return wfrp3e.dice.CheckRoll.create(formula, rollData);
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
			|| (await wfrp3e.dice.DiePool.createFromInitiative(this.actor, this.combat)).formula
		);
	}
}
