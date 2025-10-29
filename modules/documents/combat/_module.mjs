import Combat from "./combat.mjs";
import Combatant from "./combatant.mjs";

export function assignDocumentClasses()
{
	CONFIG.Combat.documentClass = Combat;
	CONFIG.Combatant.documentClass = Combatant;
}
