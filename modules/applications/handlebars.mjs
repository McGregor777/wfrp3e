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
		"systems/wfrp3e/templates/applications/sheets/actors/partials/career-advancement.hbs",
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
		"systems/wfrp3e/templates/applications/sheets/items/partials/career-advancement.hbs",
		"systems/wfrp3e/templates/applications/sheets/items/partials/trapping-data.hbs",
		"systems/wfrp3e/templates/partials/action-effects.hbs"
	]);
}

export function initialiseHelpers()
{
	Handlebars.registerHelper({
		abs,
		find,
		fromUuid,
		getProperty,
		includes,
		increment,
		length,
		multiply,
		replace,
		stripTags,
		uppercase,
		"capitalize": (string) => capitalize(string),
		"for": (startingNumber, goalNumber, increment, block) => forLoop(startingNumber, goalNumber, increment, block),
		same: (v1, v2) => v1 == v2,
	});

	/**
	 * Returns the absolute value of a number.
	 * @param {number} number The number to get the absolute value of.
	 * @returns {number} The absolute value of the number.
	 */
	function abs(number)
	{
		return Math.abs(number);
	}

	/**
	 * Finds an item in an array.
	 * @param {any} value The value to find in the array.
	 * @param {Array} array The array to search in.
	 * @returns {any} The found item, or undefined if not found.
	 */
	function find(value, array)
	{
		return array.find(item => item === value);
	}

	/**
	 * Fetches a document by its uuid.
	 * @param {string} uuid The uuid of the document to fetch.
	 * @returns {Document} The fetched document, or undefined if none has been found.
	 */
	function fromUuid(uuid)
	{
		return fromUuidSync(uuid);
	}

	/**
	 * Creates a for loop in Handlebars to instantiate a block a number of times.
	 * @param {number} startingNumber The starting number of the loop.
	 * @param {number} goalNumber The goal number of the loop.
	 * @param {number} increment The increment of the loop.
	 * @param {any} block The block to instantiate.
	 * @returns {string} The accumulated string.
	 */
	function forLoop(startingNumber, goalNumber, increment, block)
	{
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
	}

	/**
	 * Returns a property of an object.
	 * @param {any} object The object to get the property from.
	 * @param {string} key The key of the property to get.
	 * @returns {any} The property of the object.
	 */
	function getProperty(object, key)
	{
		return foundry.utils.getProperty(object, key);
	}

	/**
	 * Checks if a value is included in an array or string.
	 * @param {Array|string} needle The value to check for.
	 * @param {any} haystack The array or string to search in.
	 * @returns {boolean} True if the value is included in the array or string, false otherwise.
	 */
	function includes(needle, haystack)
	{
		if(haystack instanceof String || haystack instanceof Array)
			return haystack.includes(needle);
		else
			throw new Error("Haystack is not of a valid type.");
	}

	/**
	 * Increments a value by a given amount.
	 * @param {number} value The value to increment.
	 * @param {number} valueToAdd The amount to increment by.
	 * @returns {number} The incremented value.
	 */
	function increment(value, valueToAdd)
	{
		return value + parseInt(valueToAdd);
	}

	/**
	 * Gets the number of properties in an object.
	 * @param {Object} object The value to increment.
	 * @returns {number} The incremented value.
	 */
	function length(object)
	{
		return Object.keys(object).length;
	}

	/**
	 * Multiplies a value by a given multiplier.
	 * @param {number} value The value to multiply.
	 * @param {number} multiplier The multiplier to multiply by.
	 * @returns {number} The multiplied value.
	 */
	function multiply(value, multiplier)
	{
		return value * multiplier;
	}

	/**
	 * Replaces a match in a string with a replacement.
	 * @param {string} string The string to replace the match in.
	 * @param {string} match The match to replace.
	 * @param {string} replacement The replacement for the match.
	 * @returns {string} The string with the match replaced.
	 */
	function replace(string, match, replacement)
	{
		return string.replace(match, replacement);
	}

	/**
	 * Removes HTML tags from a string.
	 * @param {string} value The string to remove HTML tags from.
	 * @param {string} tag The tag to remove.
	 * @returns {string} The string with HTML tags removed.
	 */
	function stripTags(value, tag)
	{
		const matches = [...value.matchAll(new RegExp("(<" + tag + "*.>).*(</" + tag + ">)", "g"))];

		for(let i = 1; i < matches[0]?.length; i++)
			value = value.replace(matches[0][i], "");

		return value;
	}

	/**
	 * Converts a string to uppercase.
	 * @param {string} string The string to convert to uppercase.
	 * @returns {string} The uppercased string.
	 */
	function uppercase(string)
	{
		return (string).toUpperCase();
	}
}
