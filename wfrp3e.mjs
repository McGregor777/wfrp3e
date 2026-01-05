/**
 * Warhammer Fantasy Roleplay - 3rd Edition's Game System for Foundry VTT
 * A Foundry VTT game system for Warhammer Fantasy Roleplay - 3rd Edition.
 * Author: Grégory "McGregor777" Gauthier
 * Software License: MIT
 * Repository: https://github.com/McGregor777/wfrp3e
 * Issue Tracker: https://github.com/foundryvtt/wfrp3e/issues
 */

import * as wfrp3e from "./modules/_module.mjs";
import {initialiseHandlebars} from "./modules/applications/_module.mjs";
globalThis.wfrp3e = wfrp3e;

Hooks.once("init", async () => {
	console.log("WFRP3e | Initialising Game System");

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

	wfrp3e.applications.initialiseHandlebars();
	wfrp3e.applications.initialiseTextEnrichers();
	wfrp3e.applications.sheets.registerSheets();
	wfrp3e.applications.sidebar.tabs.configureTabs();
	wfrp3e.applications.ux.replaceContextMenu();
	wfrp3e.data.assignDataModels();
	wfrp3e.dice.assignRollClasses();
	wfrp3e.dice.terms.assignTerms();
	wfrp3e.documents.assignDocumentClasses();

	console.log("WFRP3e | Game System initialised | Welcome to the grim and perilous world of Warhammer Fantasy Roleplay - 3rd Edition!");
});

//#TODO Transfer this behaviour into a WFRP3eChatLog (if possible).
Hooks.on("renderChatMessage", (message, html, context) => {
	html.find(".dice-rolls .add-dice-pool").click(async (event) => {
		event.stopPropagation();
		message.rolls[0].addDicePool(await wfrp3e.applications.dice.CheckBuilder.wait(), {chatMessage: message});
	});

	html.find(".roll-effects:not(.disabled) .effect-toggle").click((event) => {
		event.stopPropagation();

		wfrp3e.dice.CheckRoll.toggleActionEffect(
			$(event.currentTarget).parents(".chat-message").data("messageId"),
			event.currentTarget.dataset.symbol,
			event.currentTarget.dataset.index
		);
	});
});

Hooks.on("applyActiveEffect", (actor, change, current, delta, object) => {
	foundry.utils.setProperty(actor, change.key, current - Math.sign(current) * delta);
});

// Register all WFRP3e special dice to Dice So Nice!
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
