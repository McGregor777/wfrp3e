import ChallengeDie from "./challenge.mjs";
import CharacteristicDie from "./characteristic.mjs";
import ConservativeDie from "./conservative.mjs";
import ExpertiseDie from "./expertise.mjs";
import FortuneDie from "./fortune.mjs";
import MisfortuneDie from "./misfortune.mjs";
import RecklessDie from "./reckless.mjs";

export {default as Die} from "./die.mjs";
export {ChallengeDie, CharacteristicDie, ConservativeDie, ExpertiseDie, FortuneDie, MisfortuneDie, RecklessDie};

export function assignTerms()
{
	CONFIG.Dice.terms["h"] = ChallengeDie;
	CONFIG.Dice.terms["a"] = CharacteristicDie;
	CONFIG.Dice.terms["o"] = ConservativeDie;
	CONFIG.Dice.terms["e"] = ExpertiseDie;
	CONFIG.Dice.terms["f"] = FortuneDie;
	CONFIG.Dice.terms["m"] = MisfortuneDie;
	CONFIG.Dice.terms["r"] = RecklessDie;
}

/**
 * Returns the special die classes sorted in canonical order.
 * @returns {{characteristic: CharacteristicDie, fortune: FortuneDie, expertise: ExpertiseDie, conservative: ConservativeDie, reckless: RecklessDie, challenge: ChallengeDie, misfortune: MisfortuneDie}}
 */
export function getSpecialDieClasses()
{
	return {
		characteristic: CharacteristicDie,
		fortune: FortuneDie,
		expertise: ExpertiseDie,
		conservative: ConservativeDie,
		reckless: RecklessDie,
		challenge: ChallengeDie,
		misfortune: MisfortuneDie
	}
}
