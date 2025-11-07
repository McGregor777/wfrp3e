import Ability from "./ability.mjs";
import Action from "./action.mjs";
import Armour from "./armour.mjs";
import Career from "./career.mjs";
import Condition from "./condition.mjs";
import CriticalWound from "./critical-wound.mjs";
import Disease from "./disease.mjs";
import Insanity from "./insanity.mjs";
import Miscast from "./miscast.mjs";
import Money from "./money.mjs";
import Mutation from "./mutation.mjs";
import Skill from "./skill.mjs";
import Talent from "./talent.mjs";
import Trapping from "./trapping.mjs";
import Weapon from "./weapon.mjs";

export * as career from "./career/_module.mjs";
export {default as Item} from "./item.mjs";
export {
	Ability,
	Action,
	Armour,
	Career,
	Condition,
	CriticalWound,
	Disease,
	Insanity,
	Miscast,
	Money,
	Mutation,
	Skill,
	Talent,
	Trapping,
	Weapon
};

export function assignDataModels()
{
	Object.assign(CONFIG.Item.dataModels, {
		"ability": Ability,
		"action": Action,
		"armour": Armour,
		"career": Career,
		"condition": Condition,
		"criticalWound": CriticalWound,
		"disease": Disease,
		"insanity": Insanity,
		"miscast": Miscast,
		"money": Money,
		"mutation": Mutation,
		"skill": Skill,
		"talent": Talent,
		"trapping": Trapping,
		"weapon": Weapon
	});
}
