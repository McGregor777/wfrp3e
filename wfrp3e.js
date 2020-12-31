import {wfrp3e} from "./module/config.js";
import WFRP3ActorSheet from "./module/sheets/wfrp3e-actorsheet.js";
import WFRP3CreatureSheet from "./module/sheets/wfrp3e-creaturesheet.js";
import WFRP3ItemSheet from "./module/sheets/wfrp3e-itemsheet.js";
import WFRP3TalentSheet from "./module/sheets/wfrp3e-talentsheet.js";

async function preloadHandlebarsTemplates()
{
	const templatePaths =
	[
		"systems/wfrp3e/templates/partials/actor-stat-block.html",
	];

	return loadTemplates(templatePaths);
}

Hooks.once("init", function()
{
	console.log("wfrp3e | Initialising Warhammer Fantasy Roleplay - 3rd Edition System");

	CONFIG.wfrp3e = wfrp3e;

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("wfrp3e", WFRP3ActorSheet, {label: "Actor Sheet", makeDefault: true});
	Actors.registerSheet("wfrp3e", WFRP3CreatureSheet, {label: "Creature Sheet", types: ["creature"], makeDefault: true});
	
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("wfrp3e", WFRP3ItemSheet, {label: "Item Sheet", makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3TalentSheet, {label: "Talent Sheet", types: ["talent"], makeDefault: true});

	preloadHandlebarsTemplates();
});