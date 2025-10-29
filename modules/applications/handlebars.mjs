import {capitalize} from "../helpers.mjs";

export function preloadTemplates()
{
	return foundry.applications.handlebars.loadTemplates([
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
	]);
}

export function initializeHelpers()
{
	Handlebars.registerHelper("abs", (number) => Math.abs(number));
	Handlebars.registerHelper("capitalize", (string) => capitalize(string));
	Handlebars.registerHelper("equalTo", (value, compareValue) => value == compareValue);
	Handlebars.registerHelper("find", (value, array) => array.find(item => item === value));
	Handlebars.registerHelper("getProperty", (object, key) => foundry.utils.getProperty(object, key));
	Handlebars.registerHelper("in", (value, array) => array.includes(value));
	Handlebars.registerHelper("increment", (value, valueToAdd) => value + parseInt(valueToAdd));
	Handlebars.registerHelper("inferiorTo", (value, compareValue) => Number(value) < Number(compareValue));
	Handlebars.registerHelper("inferiorOrEqualTo", (value, compareValue) => Number(value) <= Number(compareValue));
	Handlebars.registerHelper("multiply", (value, multiplier) => value * multiplier);
	Handlebars.registerHelper("notEqualTo", (value, compareValue) => value != compareValue);
	Handlebars.registerHelper("sameAs", (value, compareValue) => value === compareValue);
	Handlebars.registerHelper("setVar", (name, value, options) => {options.data.root[name] = value});
	Handlebars.registerHelper("superiorTo", (value, compareValue) => Number(value) > Number(compareValue));
	Handlebars.registerHelper("superiorOrEqualTo", (value, compareValue) => Number(value) >= Number(compareValue));
	Handlebars.registerHelper("uppercase", (string) => (string).toUpperCase());

	Handlebars.registerHelper("for", (startingNumber, goalNumber, increment, block) => {
		let accumulator = "";

		if(startingNumber <= goalNumber) {
			if(increment < 1)
				throw new Error("Increment cannot be inferior to 1 if the starting number is inferior or equal to the goal number");

			for(let i = startingNumber; i < goalNumber; i += increment)
				accumulator += block.fn(i);
		}
		else {
			if(increment > -1)
				throw new Error("Increment cannot be superior to -1 if the starting number is superior to the goal number");

			for(let i = startingNumber; i > goalNumber; i += increment)
				accumulator += block.fn(i);
		}

		return accumulator;
	});

	Handlebars.registerHelper("include", (needle, haystack) => {
		if(haystack instanceof String || haystack instanceof Array)
			return haystack.includes(needle);
		else
			throw new Error("Haystack is not of a valid type.");
	});

	Handlebars.registerHelper("replace", (string, match, replacement) => {
		if(string.includes(match))
			return string.replace(match, replacement);
		else
			throw new Error("Unable to find match in the string.");
	});

	Handlebars.registerHelper("striptags", (value, tag) => {
		const matches = [...value.matchAll(new RegExp("(<" + tag + "*.>).*(</" + tag + ">)", "g"))];

		for(let i = 1; i < matches[0]?.length; i++)
			value = value.replace(matches[0][i], "");

		return value;
	});
}
