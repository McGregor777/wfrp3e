import {capitalize} from "../helpers.js";

export default function()
{
	Hooks.on("init", () => {
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
	});
}