import {WFRP3E} from "./modules/config.js";
import WFRP3EActor from "./modules/actors/WFRP3ECharacter.js"
import WFRP3EItem from "./modules/items/WFRP3EItem.js"
import WFRP3CharacterSheet from "./modules/sheets/WFRP3CharacterSheet.js";
import WFRP3ECreatureSheet from "./modules/sheets/WFRP3ECreatureSheet.js";
import WFRP3EActionSheet from "./modules/sheets/WFRP3EActionSheet.js";
import WFRP3EArmourSheet from "./modules/sheets/WFRP3EArmourSheet.js";
import WFRP3ECareerSheet from "./modules/sheets/WFRP3ECareerSheet.js";
import WFRP3EMoneySheet from "./modules/sheets/WFRP3EMoneySheet.js";
import WFRP3ESkillSheet from "./modules/sheets/WFRP3ESkillSheet.js";
import WFRP3ETalentSheet from "./modules/sheets/WFRP3ETalentSheet.js";
import WFRP3EWeaponSheet from "./modules/sheets/WFRP3EWeaponSheet.js";
import WFRP3ETrappingSheet from "./modules/sheets/WFRP3ETrappingSheet.js";
import * as handlebarsHelpers from "./modules/handlebars.js";

async function preloadHandlebarsTemplates()
{
	const templatePaths =
	[
		"systems/wfrp3e/templates/partials/attribute-partial.html",
		"systems/wfrp3e/templates/partials/characteristic-partial.html",
		"systems/wfrp3e/templates/partials/impairment-partial.html",
		"systems/wfrp3e/templates/partials/item-action-card.html",
		"systems/wfrp3e/templates/partials/item-armour-row.html",
		"systems/wfrp3e/templates/partials/item-career-partial.html",
		"systems/wfrp3e/templates/partials/item-money-row.html",
		"systems/wfrp3e/templates/partials/item-skill-row.html",
		"systems/wfrp3e/templates/partials/item-talent-card.html",
		"systems/wfrp3e/templates/partials/item-trapping-row.html",
		"systems/wfrp3e/templates/partials/item-weapon-row.html",
	];

	return loadTemplates(templatePaths);
}

Hooks.once("init", function()
{
	console.log("WFRP3E | Initialising Warhammer Fantasy Roleplay - 3rd Edition System");

	CONFIG.WFRP3E = WFRP3E;
	CONFIG.Actor.documentClass = WFRP3EActor;
	CONFIG.Item.documentClass = WFRP3EItem;

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("WFRP3E", WFRP3CharacterSheet, { label: "Character Sheet", types: ["character"], makeDefault: true });
	Actors.registerSheet("WFRP3E", WFRP3ECreatureSheet, { label: "Creature Sheet", types: ["creature"], makeDefault: true });
	
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("WFRP3E", WFRP3EActionSheet, { label: "Action Sheet", types: ["action"], makeDefault: true });
	Items.registerSheet("WFRP3E", WFRP3EArmourSheet, { label: "Armour Sheet", types: ["armour"], makeDefault: true });
	Items.registerSheet("WFRP3E", WFRP3ECareerSheet, { label: "Career Sheet", types: ["career"], makeDefault: true });
	Items.registerSheet("WFRP3E", WFRP3EMoneySheet, { label: "Money Sheet", types: ["money"], makeDefault: true });
	Items.registerSheet("WFRP3E", WFRP3ESkillSheet, { label: "Skill Sheet", types: ["skill"], makeDefault: true });
	Items.registerSheet("WFRP3E", WFRP3ETalentSheet, { label: "Talent Sheet", types: ["talent"], makeDefault: true });
	Items.registerSheet("WFRP3E", WFRP3EWeaponSheet, { label: "Weapon Sheet", types: ["weapon"], makeDefault: true });
	Items.registerSheet("WFRP3E", WFRP3ETrappingSheet, { label: "Trapping Sheet", types: ["trapping"], makeDefault: true });

	preloadHandlebarsTemplates();
});

handlebarsHelpers.default();