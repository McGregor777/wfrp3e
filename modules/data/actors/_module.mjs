import Character from "./character.mjs";
import Creature from "./creature.mjs";
import Group from "./group.mjs";
import Party from "./party.mjs";

export {default as Actor} from "./actor.mjs";
export {Character, Creature, Group, Party};

export function assignDataModels()
{
	Object.assign(CONFIG.Actor.dataModels, {
		"character": Character,
		"creature": Creature,
		"group": Group,
		"party": Party
	});
}
