import {WFRP3e} from "./modules/config.js";
import WFRP3eActor from "./modules/actors/WFRP3eActor.js"
import WFRP3eActionDataModel from "./modules/data/items/WFRP3eActionDataModel.js";
import ChallengeDie from "./modules/dice/dietype/ChallengeDie.js";
import CharacteristicDie from "./modules/dice/dietype/CharacteristicDie.js";
import ConservativeDie from "./modules/dice/dietype/ConservativeDie.js";
import ExpertiseDie from "./modules/dice/dietype/ExpertiseDie.js";
import FortuneDie from "./modules/dice/dietype/FortuneDie.js";
import MisfortuneDie from "./modules/dice/dietype/MisfortuneDie.js";
import RecklessDie from "./modules/dice/dietype/RecklessDie.js";
import CheckBuilder from "./modules/dice/CheckBuilder.js";
import CheckHelper from "./modules/dice/CheckHelper.js";
import DicePool from "./modules/dice/DicePool.js";
import WFRP3eRoll from "./modules/dice/WFRP3eRoll.js";
import WFRP3eItem from "./modules/items/WFRP3eItem.js"
import WFRP3eCharacterSheet from "./modules/sheets/actors/WFRP3eCharacterSheet.js";
import WFRP3eCreatureSheet from "./modules/sheets/actors/WFRP3eCreatureSheet.js";
import WFRP3eGroupSheet from "./modules/sheets/actors/WFRP3eGroupSheet.js";
import WFRP3ePartySheet from "./modules/sheets/actors/WFRP3ePartySheet.js";
import WFRP3eAbilitySheet from "./modules/sheets/items/WFRP3eAbilitySheet.js";
import WFRP3eActionSheet from "./modules/sheets/items/WFRP3eActionSheet.js";
import WFRP3eArmourSheet from "./modules/sheets/items/WFRP3eArmourSheet.js";
import WFRP3eCareerSheet from "./modules/sheets/items/WFRP3eCareerSheet.js";
import WFRP3eConditionSheet from "./modules/sheets/items/WFRP3eConditionSheet.js";
import WFRP3eCriticalWoundSheet from "./modules/sheets/items/WFRP3eCriticalWoundSheet.js";
import WFRP3eDiseaseSheet from "./modules/sheets/items/WFRP3eDiseaseSheet.js";
import WFRP3eInsanitySheet from "./modules/sheets/items/WFRP3eInsanitySheet.js";
import WFRP3eMiscastSheet from "./modules/sheets/items/WFRP3eMiscastSheet.js";
import WFRP3eMoneySheet from "./modules/sheets/items/WFRP3eMoneySheet.js";
import WFRP3eMutationSheet from "./modules/sheets/items/WFRP3eMutationSheet.js";
import WFRP3eSkillSheet from "./modules/sheets/items/WFRP3eSkillSheet.js";
import WFRP3eTalentSheet from "./modules/sheets/items/WFRP3eTalentSheet.js";
import WFRP3eTrappingSheet from "./modules/sheets/items/WFRP3eTrappingSheet.js";
import WFRP3eWeaponSheet from "./modules/sheets/items/WFRP3eWeaponSheet.js";
import * as handlebarsHelpers from "./modules/handlebars.js";

async function preloadHandlebarsTemplates()
{
	const templatePaths = [
		"systems/wfrp3e/templates/chatmessages/action-effects.hbs",
		"systems/wfrp3e/templates/partials/attribute-partial.html",
		"systems/wfrp3e/templates/partials/characteristic-partial.hbs",
		"systems/wfrp3e/templates/partials/impairment-partial.html",
		"systems/wfrp3e/templates/partials/item-ability-card.html",
		"systems/wfrp3e/templates/partials/item-action-card.hbs",
		"systems/wfrp3e/templates/partials/item-armour-row.html",
		"systems/wfrp3e/templates/partials/item-career-partial.hbs",
		"systems/wfrp3e/templates/partials/item-condition-card.html",
		"systems/wfrp3e/templates/partials/item-disease-card.html",
		"systems/wfrp3e/templates/partials/item-insanity-card.html",
		"systems/wfrp3e/templates/partials/item-money-row.html",
		"systems/wfrp3e/templates/partials/item-mutation-card.html",
		"systems/wfrp3e/templates/partials/item-miscast-card.html",
		"systems/wfrp3e/templates/partials/item-skill-row.hbs",
		"systems/wfrp3e/templates/partials/item-talent-card.html",
		"systems/wfrp3e/templates/partials/item-trapping-row.html",
		"systems/wfrp3e/templates/partials/item-weapon-row.hbs",
		"systems/wfrp3e/templates/partials/item-wound-card.html"
	];

	return loadTemplates(templatePaths);
}

Hooks.once("init", () => {
	console.log("WFRP3e | Initialising Warhammer Fantasy Roleplay - 3rd Edition System");

	game.symbols = {diceterms: [ChallengeDie, CharacteristicDie, ConservativeDie, ExpertiseDie, FortuneDie, MisfortuneDie, RecklessDie]};

	CONFIG.WFRP3e = WFRP3e;

	CONFIG.Actor.documentClass = WFRP3eActor;

	CONFIG.Item.dataModels.action = WFRP3eActionDataModel;
	CONFIG.Item.documentClass = WFRP3eItem;

	CONFIG.Dice.rolls.push(CONFIG.Dice.rolls[0]);
	CONFIG.Dice.rolls[0] = WFRP3eRoll;

	CONFIG.Dice.terms["h"] = ChallengeDie;
	CONFIG.Dice.terms["a"] = CharacteristicDie;
	CONFIG.Dice.terms["o"] = ConservativeDie;
	CONFIG.Dice.terms["e"] = ExpertiseDie;
	CONFIG.Dice.terms["f"] = FortuneDie;
	CONFIG.Dice.terms["m"] = MisfortuneDie;
	CONFIG.Dice.terms["r"] = RecklessDie;

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("wfrp3e", WFRP3eCharacterSheet, {label: "Character Sheet", types: ["character"], makeDefault: true});
	Actors.registerSheet("wfrp3e", WFRP3ePartySheet, {label: "Party Sheet", types: ["party"], makeDefault: true});
	Actors.registerSheet("wfrp3e", WFRP3eCreatureSheet, {label: "Creature Sheet", types: ["creature"], makeDefault: true});
	Actors.registerSheet("wfrp3e", WFRP3eGroupSheet, {label: "Group Sheet", types: ["group"], makeDefault: true});

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("wfrp3e", WFRP3eAbilitySheet, {label: "Ability Sheet", types: ["ability"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eActionSheet, {label: "Action Sheet", types: ["action"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eArmourSheet, {label: "Armour Sheet", types: ["armour"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eCareerSheet, {label: "Career Sheet", types: ["career"], makeDefault: true})
	Items.registerSheet("wfrp3e", WFRP3eConditionSheet, {label: "Condition Sheet", types: ["condition"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eCriticalWoundSheet, {label: "Critical Wound Sheet", types: ["criticalWound"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eDiseaseSheet, {label: "Disease Sheet", types: ["disease"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eInsanitySheet, {label: "Insanity Sheet", types: ["insanity"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eMiscastSheet, {label: "Miscast Sheet", types: ["miscast"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eMoneySheet, {label: "Money Sheet", types: ["money"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eMutationSheet, {label: "Mutation Sheet", types: ["mutation"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eSkillSheet, {label: "Skill Sheet", types: ["skill"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eTalentSheet, {label: "Talent Sheet", types: ["talent"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eWeaponSheet, {label: "Weapon Sheet", types: ["weapon"], makeDefault: true});
	Items.registerSheet("wfrp3e", WFRP3eTrappingSheet, {label: "Trapping Sheet", types: ["trapping"], makeDefault: true});

	preloadHandlebarsTemplates();
});

Hooks.on('renderSidebarTab', (app, html, data) => {
	const chatControls = html.find("#chat-controls > .control-buttons");

	if(chatControls.length > 0) {
		chatControls.prepend(
			'<a class="wfrp3e-dice-roller" role="button" data-tooltip="' + game.i18n.localize("ROLL.FreeCheck") +' ">' +
			'	<img src="systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp" alt="' + game.i18n.localize("ROLL.FreeCheck") + '"/>' +
			'</a>'
		);

		html.find("#chat-controls > .control-buttons > .wfrp3e-dice-roller").click(async () => {
			await new CheckBuilder().render(true);
		});
	}
});

// Update chat messages with dice images
Hooks.on("renderChatMessage", (app, html, messageData) => {
	const content = html.find(".message-content");

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

		if(li.dataset.uuid)
			uuid = li.dataset.uuid;

		const parts = uuid.split(".");
		const [entityName, entityId, embeddedName, embeddedId] = parts;

		await EmbeddedItemHelpers.displayOwnedItemItemModifiersAsJournal(embeddedId, modifierType, modifierId, entityId);
	});

	html.find(".roll-effects .effect-toggle").click((event) => {
		event.stopPropagation();

		CheckHelper.toggleEffect(
			$(event.currentTarget).parents(".chat-message").data("messageId"),
			event.currentTarget.dataset.symbol,
			event.currentTarget.dataset.index
		);
	});
});

handlebarsHelpers.default();