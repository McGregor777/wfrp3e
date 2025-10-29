/** @module dice */

import CheckRoll from "./roll.mjs";

export * as terms from "./terms/_module.mjs";
export {default as CheckHelper} from "./check-helper.mjs";
export {default as DiePool} from "./die-pool.mjs";
export {CheckRoll};

export function assignRollClasses()
{
	CONFIG.Dice.rolls.push(CONFIG.Dice.rolls[0]);
	CONFIG.Dice.rolls[0] = CheckRoll;
}
