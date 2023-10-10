export default function()
{
    Hooks.on("init", () => {
		Handlebars.registerHelper("superiorTo", (value, compareValue) => {
			return value > compareValue;
		});

		Handlebars.registerHelper("inferiorTo", (value, compareValue) => {
			return value < compareValue;
		});

		Handlebars.registerHelper("equalTo", (value, compareValue) => {
			return value == compareValue;
		});

        Handlebars.registerHelper("superiorOrEqualTo", (value, compareValue) => {
			return value >= compareValue;
		});

		Handlebars.registerHelper("inferiorOrEqualTo", (value, compareValue) => {
			return value <= compareValue;
		});

		Handlebars.registerHelper("increment", (value, valueToAdd) => {
			return value + parseInt(valueToAdd);
		});

		Handlebars.registerHelper("multiply", (value, multiplier) => {
			return value * multiplier;
		});

		Handlebars.registerHelper("concat", (value, otherValue) => {
			return value.toString() + otherValue.toString();
		});

		Handlebars.registerHelper("for", (startingNumber, goalNumber, increment, block) => {
			let accum = "";

			if(startingNumber <= goalNumber) {
				if(increment < 1)
					throw new Error("Increment cannot be inferior to 1 if the starting number is inferior or equal to the goal number");

				for(let i = startingNumber; i < goalNumber; i += increment)
					accum += block.fn(i);
			}
			else {
				if(increment > -1)
					throw new Error("Increment cannot be superior to -1 if the starting number is superior to the goal number");

				for(let i = startingNumber; i > goalNumber; i += increment)
					accum += block.fn(i);
			}

			return accum;
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

		Handlebars.registerHelper("abbreviateCharacteristic", (value) => {
			switch(value) {
				case "strength":
					return "CHARACTERISTIC.ABBREVIATION.Strength";
				case "toughness":
					return "CHARACTERISTIC.ABBREVIATION.Toughness";
				case "agility":
					return "CHARACTERISTIC.ABBREVIATION.Agility";
				case "intelligence":
					return "CHARACTERISTIC.ABBREVIATION.Intelligence";
				case "willpower":
					return "CHARACTERISTIC.ABBREVIATION.Willpower";
				case "fellowship":
					return "CHARACTERISTIC.ABBREVIATION.Fellowship";
			}
		});
	});
}