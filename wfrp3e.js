import {WFRP3E} from "./modules/config.js";
import WFRP3EActor from "./modules/actors/WFRP3ECharacter.js"
import WFRP3EItem from "./modules/items/WFRP3EItem.js"
import WFRP3ECharacterSheet from "./modules/sheets/WFRP3ECharacterSheet.js";
import WFRP3ECreatureSheet from "./modules/sheets/WFRP3ECreatureSheet.js";
import WFRP3EActionSheet from "./modules/sheets/WFRP3EActionSheet.js";
import WFRP3EArmourSheet from "./modules/sheets/WFRP3EArmourSheet.js";
import WFRP3ECareerSheet from "./modules/sheets/WFRP3ECareerSheet.js";
import WFRP3EMoneySheet from "./modules/sheets/WFRP3EMoneySheet.js";
import WFRP3ESkillSheet from "./modules/sheets/WFRP3ESkillSheet.js";
import WFRP3ETalentSheet from "./modules/sheets/WFRP3ETalentSheet.js";
import WFRP3EWeaponSheet from "./modules/sheets/WFRP3EWeaponSheet.js";
import WFRP3ETrappingSheet from "./modules/sheets/WFRP3ETrappingSheet.js";
import ChallengeDie from "./modules/dice/dietype/ChallengeDie.js";
import CharacteristicDie from "./modules/dice/dietype/CharacteristicDie.js";
import ConservativeDie from "./modules/dice/dietype/ConservativeDie.js";
import ExpertiseDie from "./modules/dice/dietype/ExpertiseDie.js";
import FortuneDie from "./modules/dice/dietype/FortuneDie.js";
import MisfortuneDie from "./modules/dice/dietype/MisfortuneDie.js";
import RecklessDie from "./modules/dice/dietype/RecklessDie.js";
import DicePool from "./modules/dice/DicePool.js";
import WFRP3ERoll from "./modules/dice/WFRP3ERoll.js";
import PopoutEditor from "./modules/PopoutEditor.js";
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

	game.symbols =
	{
		diceterms: [ChallengeDie, CharacteristicDie, ConservativeDie, ExpertiseDie, FortuneDie, MisfortuneDie, RecklessDie],
	};

	CONFIG.WFRP3E = WFRP3E;
	CONFIG.Actor.documentClass = WFRP3EActor;
	CONFIG.Item.documentClass = WFRP3EItem;
	CONFIG.Dice.rolls.push(CONFIG.Dice.rolls[0]);
	CONFIG.Dice.rolls[0] = WFRP3ERoll;
	CONFIG.Dice.terms["h"] = ChallengeDie;
	CONFIG.Dice.terms["a"] = CharacteristicDie;
	CONFIG.Dice.terms["o"] = ConservativeDie;
	CONFIG.Dice.terms["e"] = ExpertiseDie;
	CONFIG.Dice.terms["f"] = FortuneDie;
	CONFIG.Dice.terms["m"] = MisfortuneDie;
	CONFIG.Dice.terms["r"] = RecklessDie;

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("WFRP3E", WFRP3ECharacterSheet, {label: "Character Sheet", types: ["character"], makeDefault: true});
	Actors.registerSheet("WFRP3E", WFRP3ECreatureSheet, {label: "Creature Sheet", types: ["creature"], makeDefault: true});
	
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("WFRP3E", WFRP3EActionSheet, {label: "Action Sheet", types: ["action"], makeDefault: true});
	Items.registerSheet("WFRP3E", WFRP3EArmourSheet, {label: "Armour Sheet", types: ["armour"], makeDefault: true});
	Items.registerSheet("WFRP3E", WFRP3ECareerSheet, {label: "Career Sheet", types: ["career"], makeDefault: true});
	Items.registerSheet("WFRP3E", WFRP3EMoneySheet, {label: "Money Sheet", types: ["money"], makeDefault: true});
	Items.registerSheet("WFRP3E", WFRP3ESkillSheet, {label: "Skill Sheet", types: ["skill"], makeDefault: true});
	Items.registerSheet("WFRP3E", WFRP3ETalentSheet, {label: "Talent Sheet", types: ["talent"], makeDefault: true});
	Items.registerSheet("WFRP3E", WFRP3EWeaponSheet, {label: "Weapon Sheet", types: ["weapon"], makeDefault: true});
	Items.registerSheet("WFRP3E", WFRP3ETrappingSheet, {label: "Trapping Sheet", types: ["trapping"], makeDefault: true});

	preloadHandlebarsTemplates();
});

// Update chat messages with dice images
Hooks.on("renderChatMessage", (app, html, messageData) => {
	const content = html.find(".message-content");
	content[0].innerHTML = PopoutEditor.renderDiceImages(content[0].innerHTML);

	html.on("click", ".special-pool-to-player", () => {
		const poolData = messageData.message.flags.wfrp3e;

		const dicePool = new DicePool(poolData.dicePool);

		DiceHelpers.displayRollDialog(poolData.roll.data, dicePool, poolData.description, poolData.roll.skillName, poolData.roll.item, poolData.roll.flavor, poolData.roll.sound);
	});

	html.find(".item-display .item-pill, .item-properties .item-pill").on("click", async (event) => {
		event.preventDefault();
		event.stopPropagation();
		const li = event.currentTarget;
		let uuid = li.dataset.itemId;
		let modifierId = li.dataset.modifierId;
		let modifierType = li.dataset.modifierType;

		if (li.dataset.uuid) {
			uuid = li.dataset.uuid;
		}

		const parts = uuid.split(".");

		const [entityName, entityId, embeddedName, embeddedId] = parts;

		await EmbeddedItemHelpers.displayOwnedItemItemModifiersAsJournal(embeddedId, modifierType, modifierId, entityId);
	});
});

handlebarsHelpers.default();