export default function()
{
    Hooks.on("init", () => {
		Handlebars.registerHelper("superiorTo", (value, compareValue) => value > compareValue);
		Handlebars.registerHelper("inferiorTo", (value, compareValue) => value < compareValue);
		Handlebars.registerHelper("equalTo", (value, compareValue) => value == compareValue);
        Handlebars.registerHelper("superiorOrEqualTo", (value, compareValue) => value >= compareValue);
		Handlebars.registerHelper("inferiorOrEqualTo", (value, compareValue) => value <= compareValue);
		Handlebars.registerHelper("increment", (value, valueToAdd) => value + parseInt(valueToAdd));
		Handlebars.registerHelper("multiply", (value, multiplier) => value * multiplier);
		Handlebars.registerHelper("concat", (value, otherValue) => value.toString() + otherValue.toString());
		Handlebars.registerHelper("capitalize", (string) => string[0].toUpperCase() + string.slice(1));
		Handlebars.registerHelper("in", (value, array) => array.includes(value));

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