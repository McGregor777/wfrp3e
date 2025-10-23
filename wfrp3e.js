import {WFRP3e} from "./modules/config.js";
import WFRP3eEffectConfig from "./modules/applications/sheets/WFRP3eEffectConfig.js";
import WFRP3eCharacterSheet from "./modules/applications/sheets/actors/WFRP3eCharacterSheet.js";
import WFRP3eCreatureSheet from "./modules/applications/sheets/actors/WFRP3eCreatureSheet.js";
import WFRP3eGroupSheet from "./modules/applications/sheets/actors/WFRP3eGroupSheet.js";
import WFRP3ePartySheet from "./modules/applications/sheets/actors/WFRP3ePartySheet.js";
import WFRP3eAbilitySheet from "./modules/applications/sheets/items/WFRP3eAbilitySheet.js";
import WFRP3eActionSheet from "./modules/applications/sheets/items/WFRP3eActionSheet.js";
import WFRP3eArmourSheet from "./modules/applications/sheets/items/WFRP3eArmourSheet.js";
import WFRP3eCareerSheet from "./modules/applications/sheets/items/WFRP3eCareerSheet.js";
import WFRP3eConditionSheet from "./modules/applications/sheets/items/WFRP3eConditionSheet.js";
import WFRP3eCriticalWoundSheet from "./modules/applications/sheets/items/WFRP3eCriticalWoundSheet.js";
import WFRP3eDiseaseSheet from "./modules/applications/sheets/items/WFRP3eDiseaseSheet.js";
import WFRP3eInsanitySheet from "./modules/applications/sheets/items/WFRP3eInsanitySheet.js";
import WFRP3eMiscastSheet from "./modules/applications/sheets/items/WFRP3eMiscastSheet.js";
import WFRP3eMoneySheet from "./modules/applications/sheets/items/WFRP3eMoneySheet.js";
import WFRP3eMutationSheet from "./modules/applications/sheets/items/WFRP3eMutationSheet.js";
import WFRP3eSkillSheet from "./modules/applications/sheets/items/WFRP3eSkillSheet.js";
import WFRP3eTalentSheet from "./modules/applications/sheets/items/WFRP3eTalentSheet.js";
import WFRP3eTrappingSheet from "./modules/applications/sheets/items/WFRP3eTrappingSheet.js";
import WFRP3eWeaponSheet from "./modules/applications/sheets/items/WFRP3eWeaponSheet.js";
import WFRP3eActorDirectory from "./modules/applications/sidebar/tabs/WFRP3eActorDirectory.js";
import WFRP3eChatLog from "./modules/applications/sidebar/tabs/WFRP3eChatLog.js";
import WFRP3eCombatTracker from "./modules/applications/sidebar/tabs/WFRP3eCombatTracker.js";
import WFRP3eCombat from "./modules/documents/combat/WFRP3eCombat.js";
import WFRP3eCombatant from "./modules/documents/combat/WFRP3eCombatant.js";
import WFRP3eCharacterDataModel from "./modules/data/actors/WFRP3eCharacterDataModel.js";
import WFRP3eCreatureDataModel from "./modules/data/actors/WFRP3eCreatureDataModel.js";
import WFRP3eGroupDataModel from "./modules/data/actors/WFRP3eGroupDataModel.js";
import WFRP3ePartyDataModel from "./modules/data/actors/WFRP3ePartyDataModel.js";
import WFRP3eAbilityDataModel from "./modules/data/items/WFRP3eAbilityDataModel.js";
import WFRP3eActionDataModel from "./modules/data/items/WFRP3eActionDataModel.js";
import WFRP3eArmourDataModel from "./modules/data/items/WFRP3eArmourDataModel.js";
import WFRP3eCareerDataModel from "./modules/data/items/WFRP3eCareerDataModel.js";
import WFRP3eConditionDataModel from "./modules/data/items/WFRP3eConditionDataModel.js";
import WFRP3eCriticalWoundDataModel from "./modules/data/items/WFRP3eCriticalWoundDataModel.js";
import WFRP3eDiseaseDataModel from "./modules/data/items/WFRP3eDiseaseDataModel.js";
import WFRP3eInsanityDataModel from "./modules/data/items/WFRP3eInsanityDataModel.js";
import WFRP3eMiscastDataModel from "./modules/data/items/WFRP3eMiscastDataModel.js";
import WFRP3eMutationDataModel from "./modules/data/items/WFRP3eMutationDataModel.js";
import WFRP3eMoneyDataModel from "./modules/data/items/WFRP3eMoneyDataModel.js";
import WFRP3eSkillDataModel from "./modules/data/items/WFRP3eSkillDataModel.js";
import WFRP3eTalentDataModel from "./modules/data/items/WFRP3eTalentDataModel.js";
import WFRP3eTrappingDataModel from "./modules/data/items/WFRP3eTrappingDataModel.js";
import WFRP3eWeaponDataModel from "./modules/data/items/WFRP3eWeaponDataModel.js";
import WFRP3eCombatDataModel from "./modules/data/WFRP3eCombatDataModel.js";
import WFRP3eEffectDataModel from "./modules/data/WFRP3eEffectDataModel.js";
import CheckHelper from "./modules/dice/CheckHelper.js";
import WFRP3eRoll from "./modules/dice/WFRP3eRoll.js";
import ChallengeDie from "./modules/dice/terms/ChallengeDie.js";
import CharacteristicDie from "./modules/dice/terms/CharacteristicDie.js";
import ConservativeDie from "./modules/dice/terms/ConservativeDie.js";
import ExpertiseDie from "./modules/dice/terms/ExpertiseDie.js";
import FortuneDie from "./modules/dice/terms/FortuneDie.js";
import MisfortuneDie from "./modules/dice/terms/MisfortuneDie.js";
import RecklessDie from "./modules/dice/terms/RecklessDie.js";
import WFRP3eActor from "./modules/documents/WFRP3eActor.js"
import WFRP3eEffect from "./modules/documents/WFRP3eEffect.js"
import WFRP3eItem from "./modules/documents/WFRP3eItem.js"
import * as handlebarsHelpers from "./modules/applications/handlebars.js";

async function preloadHandlebarsTemplates()
{
	const templatePaths = [
		"systems/wfrp3e/templates/applications/apps/creation-point-investor/partial.hbs",
		"systems/wfrp3e/templates/applications/partials/ability-card.hbs",
		"systems/wfrp3e/templates/applications/partials/action-card.hbs",
		"systems/wfrp3e/templates/applications/partials/career-card.hbs",
		"systems/wfrp3e/templates/applications/partials/condition-card.hbs",
		"systems/wfrp3e/templates/applications/partials/criticalWound-card.hbs",
		"systems/wfrp3e/templates/applications/partials/disease-card.hbs",
		"systems/wfrp3e/templates/applications/partials/insanity-card.hbs",
		"systems/wfrp3e/templates/applications/partials/miscast-card.hbs",
		"systems/wfrp3e/templates/applications/partials/mutation-card.hbs",
		"systems/wfrp3e/templates/applications/partials/origin-race.hbs",
		"systems/wfrp3e/templates/applications/partials/talent-card.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/ability-row.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/ability-track.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/action-row.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/armour-row.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/attribute.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/career.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/characteristic.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/creature-attribute.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/impairment.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/money-row.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/rating.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/skill-row.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/special-ability.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/talent-row.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/trapping-row.hbs",
		"systems/wfrp3e/templates/applications/sheets/actors/partials/weapon-row.hbs",
		"systems/wfrp3e/templates/applications/sheets/items/partials/trapping-data.hbs",
		"systems/wfrp3e/templates/partials/action-effects.hbs"
	];

	return loadTemplates(templatePaths);
}

Hooks.once("init", async () => {
	console.log("WFRP3e | Initialising Warhammer Fantasy Roleplay - 3rd Edition System");

	CONFIG.WFRP3e = Object.freeze(WFRP3e);

	game.settings.register("wfrp3e", "startingCareerDrawingMethod", {
		name: "SETTINGS.startingCareerDrawingMethod.name",
		hint: "SETTINGS.startingCareerDrawingMethod.hint",
		scope: "world",
		config: true,
		type: String,
		choices: {
			"drawThree": "SETTINGS.startingCareerDrawingMethod.CHOICES.drawThree",
			"rollTable": "SETTINGS.startingCareerDrawingMethod.CHOICES.rollTable",
			"freeChoice": "SETTINGS.startingCareerDrawingMethod.CHOICES.freeChoice",
		},
		default: "drawThree"
	});

	Object.assign(CONFIG.Actor.dataModels, {
		"character": WFRP3eCharacterDataModel,
		"creature": WFRP3eCreatureDataModel,
		"group": WFRP3eGroupDataModel,
		"party": WFRP3ePartyDataModel
	});
	CONFIG.Actor.documentClass = WFRP3eActor;

	Object.assign(CONFIG.Item.dataModels, {
		"ability": WFRP3eAbilityDataModel,
		"action": WFRP3eActionDataModel,
		"armour": WFRP3eArmourDataModel,
		"career": WFRP3eCareerDataModel,
		"condition": WFRP3eConditionDataModel,
		"criticalWound": WFRP3eCriticalWoundDataModel,
		"disease": WFRP3eDiseaseDataModel,
		"insanity": WFRP3eInsanityDataModel,
		"miscast": WFRP3eMiscastDataModel,
		"money": WFRP3eMoneyDataModel,
		"mutation": WFRP3eMutationDataModel,
		"skill": WFRP3eSkillDataModel,
		"talent": WFRP3eTalentDataModel,
		"trapping": WFRP3eTrappingDataModel,
		"weapon": WFRP3eWeaponDataModel
	});
	CONFIG.Item.documentClass = WFRP3eItem;

	CONFIG.ActiveEffect.dataModels["base"] = WFRP3eEffectDataModel;
	CONFIG.ActiveEffect.documentClass = WFRP3eEffect;
	DocumentSheetConfig.registerSheet(
		ActiveEffect,
		"wfrp3e",
		WFRP3eEffectConfig, {
			label: "WFRP3e Active Effect Config",
			makeDefault: true
		});

	CONFIG.Combat.dataModels["base"] = WFRP3eCombatDataModel;
	CONFIG.Combat.documentClass = WFRP3eCombat;

	CONFIG.Combatant.documentClass = WFRP3eCombatant;

	CONFIG.Dice.rolls.push(CONFIG.Dice.rolls[0]);
	CONFIG.Dice.rolls[0] = WFRP3eRoll;

	CONFIG.Dice.terms["h"] = ChallengeDie;
	CONFIG.Dice.terms["a"] = CharacteristicDie;
	CONFIG.Dice.terms["o"] = ConservativeDie;
	CONFIG.Dice.terms["e"] = ExpertiseDie;
	CONFIG.Dice.terms["f"] = FortuneDie;
	CONFIG.Dice.terms["m"] = MisfortuneDie;
	CONFIG.Dice.terms["r"] = RecklessDie;

	CONFIG.fontDefinitions["ArnoPro"] = {
		editor: true,
		fonts: [
			{urls: ["systems/wfrp3e/assets/fonts/ArnoPro-Regular.otf"]},
			{urls: ["systems/wfrp3e/assets/fonts/ArnoPro-Bold.otf"], weight: 700},
			{urls: ["systems/wfrp3e/assets/fonts/ArnoPro-Italic.otf"], style: "italic"},
			{urls: ["systems/wfrp3e/assets/fonts/ArnoPro-BoldItalic.otf"], style: "italic", weight: 700}
		]
	};
	CONFIG.fontDefinitions["Caslon Antique"] = {editor: true, fonts: []};

	CONFIG.ui.actors = WFRP3eActorDirectory;
	CONFIG.ui.chat = WFRP3eChatLog;
	CONFIG.ui.combat = WFRP3eCombatTracker;

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("wfrp3e", WFRP3eCharacterSheet, {label: "Character Sheet", types: ["character"], makeDefault: true});
	Actors.registerSheet("wfrp3e", WFRP3eCreatureSheet, {label: "Creature Sheet", types: ["creature"], makeDefault: true});
	Actors.registerSheet("wfrp3e", WFRP3ePartySheet, {label: "Party Sheet", types: ["party"], makeDefault: true});
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

	await preloadHandlebarsTemplates();

	console.log("WFRP3e | Warhammer Fantasy Roleplay - 3rd Edition System initialized");
});

//#TODO Transfer this behaviour into a WFRP3eChatLog (if possible).
Hooks.on("renderChatMessage", (message, html, context) => {
	html.find(".roll-effects:not(.disabled) .effect-toggle").click((event) => {
		event.stopPropagation();

		CheckHelper.toggleActionEffect(
			$(event.currentTarget).parents(".chat-message").data("messageId"),
			event.currentTarget.dataset.symbol,
			event.currentTarget.dataset.index
		);
	});
});

// Register all WFRP3e special dice for Dice So Nice! support.
Hooks.once("diceSoNiceReady", (dice3d) => {
	dice3d.addSystem({id: "wfrp3e", name: "Warhammer Fantasy Roleplay - 3rd Edition"}, "preferred");

	// Characteristic Dice.
	dice3d.addDicePreset({
		type: "da",
		labels: ["", "", "s", "s", "s", "s", "B", "B"],
		system: "wfrp3e",
		colorset: "characteristic"
	}, "d10");
	dice3d.addColorset({
		name: "characteristic",
		description: "WFRP3e/Characteristic Dice",
		category: "Warhammer Fantasy Roleplay - 3rd Edition",
		foreground: "#FFFFFF",
		background: "#4040FF",
		outline: "#000000",
		material: "plastic",
		font: "WFRP3eSymbols",
		visibility: 'hidden'
	}, "preferred");

	// Fortune Dice.
	dice3d.addDicePreset({
		type: "df",
		labels: ["", "", "", "s", "s", "B"],
		system: "wfrp3e",
		colorset: "fortune"
	}, "d6");
	dice3d.addColorset({
		name: "fortune",
		description: "WFRP3e/Fortune Dice",
		category: "Warhammer Fantasy Roleplay - 3rd Edition",
		foreground: "#000000",
		background: "#FFFFFF",
		outline: "#FFFFFF",
		material: "plastic",
		font: "WFRP3eSymbols",
		visibility: 'hidden'
	}, "preferred");

	// Expertise Dice.
	dice3d.addDicePreset({
		type: "de",
		labels: ["", "s", "r", "B", "B", "S"],
		system: "wfrp3e",
		colorset: "expertise",
	}, "d6");
	dice3d.addColorset({
		name: "expertise",
		description: "WFRP3e/Expertise Dice",
		category: "Warhammer Fantasy Roleplay - 3rd Edition",
		foreground: "#000000",
		background: "#FFFF00",
		outline: "#FFFFFF",
		material: "plastic",
		font: "WFRP3eSymbols",
		visibility: 'hidden'
	}, "preferred");

	// Conservative Dice.
	dice3d.addDicePreset({
		type: "do",
		labels: ["", "s", "s", "s", "s", "B", "B", "s\nB", "s\nd", "s\nd"],
		system: "wfrp3e",
		colorset: "conservative"
	}, "d10");
	dice3d.addColorset({
		name: "conservative",
		description: "WFRP3e/Conservative Dice",
		category: "Warhammer Fantasy Roleplay - 3rd Edition",
		foreground: "#FFFFFF",
		background: "#008000",
		outline: "#000000",
		material: "plastic",
		font: "WFRP3eSymbols",
		visibility: 'hidden'
	}, "preferred");

	// Reckless Dice.
	dice3d.addDicePreset({
		type: "dr",
		labels: ["", "", "s\ns", "s\ns", "s\nB", "B\nB", "b", "b", "s\ne", "s\ne"],
		system: "wfrp3e",
		colorset: "reckless"
	}, "d10");
	dice3d.addColorset({
		name: "reckless",
		description: "WFRP3e/Reckless Dice",
		category: "Warhammer Fantasy Roleplay - 3rd Edition",
		foreground: "#FFFFFF",
		background: "#C00000",
		outline: "#000000",
		material: "plastic",
		font: "WFRP3eSymbols",
		visibility: 'hidden'
	}, "preferred");

	// Challenge Dice.
	dice3d.addDicePreset({
		type: "dh",
		labels: ["", "c", "c", "c\nc", "c\nc", "b", "b\nb", "C"],
		system: "wfrp3e",
		colorset: "challenge"
	}, "d10");
	dice3d.addColorset({
		name: "challenge",
		description: "WFRP3e/Challenge Dice",
		category: "Warhammer Fantasy Roleplay - 3rd Edition",
		foreground: "#FFFFFF",
		background: "#800080",
		outline: "#000000",
		material: "plastic",
		font: "WFRP3eSymbols",
		visibility: 'hidden'
	}, "preferred");

	// Misfortune Dice.
	dice3d.addDicePreset({
		type: "dm",
		labels: ["", "", "", "c", "c", "b"],
		system: "wfrp3e",
		colorset: "misfortune",
	}, "d6");
	dice3d.addColorset({
		name: "misfortune",
		description: "WFRP3e/Misfortune Dice",
		category: "Warhammer Fantasy Roleplay - 3rd Edition",
		foreground: "#FFFFFF",
		background: "#000000",
		outline: "#000000",
		material: "plastic",
		font: "WFRP3eSymbols",
		visibility: 'hidden'
	}, "preferred");
});

handlebarsHelpers.default();
