import CharacterSheet from "./character-sheet.mjs";
import CreatureSheet from "./creature-sheet.mjs";
import GroupSheet from "./group-sheet.mjs";
import PartySheet from "./party-sheet.mjs";

export {CharacterSheet, CreatureSheet, GroupSheet, PartySheet};

export function registerSheets()
{
	const {DocumentSheetConfig} = foundry.applications.apps;
	const actorClass = CONFIG.Actor.documentClass;

	DocumentSheetConfig.unregisterSheet(actorClass, "core", foundry.appv1.sheets.ActorSheet);
	DocumentSheetConfig.registerSheet(
		actorClass,
		"wfrp3e",
		CreatureSheet,
		{label: "Creature Sheet", types: ["creature"], makeDefault: true}
	);

	DocumentSheetConfig.registerSheet(
		actorClass,
		"wfrp3e",
		CharacterSheet,
		{label: "Character Sheet", types: ["character"], makeDefault: true}
	);

	DocumentSheetConfig.registerSheet(
		actorClass,
		"wfrp3e",
		GroupSheet,
		{label: "Group Sheet", types: ["group"], makeDefault: true}
	);

	DocumentSheetConfig.registerSheet(
		actorClass,
		"wfrp3e",
		PartySheet,
		{label: "Party Sheet", types: ["party"], makeDefault: true}
	);
}
