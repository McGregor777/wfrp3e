import PopoutEditor from "./PopoutEditor.js";

export default function()
{
    Hooks.on("init", () =>
	{
		Handlebars.registerHelper("superiorTo", function(value, compareValue)
		{
			return value > compareValue;
		});

		Handlebars.registerHelper("inferiorTo", function(value, compareValue)
		{
			return value < compareValue;
		});

		Handlebars.registerHelper("equalTo", function(value, compareValue)
		{
			return value == compareValue;
		});

        Handlebars.registerHelper("superiorOrEqualTo", function(value, compareValue)
		{
			return value >= compareValue;
		});

		Handlebars.registerHelper("inferiorOrEqualTo", function(value, compareValue)
		{
			return value <= compareValue;
		});

		Handlebars.registerHelper("increment", function(value, valueToAdd)
		{
			return value + parseInt(valueToAdd);
		});

		Handlebars.registerHelper("multiply", function(value, multiplier)
		{
			return value * multiplier;
		});

		Handlebars.registerHelper("replace", function(value, match, replacement)
		{
			if(value.includes(match))
				return value.replace(match, replacement);
			else
				throw new Error("Unable to find match in the value.");
		});

		Handlebars.registerHelper("for", function(startingNumber, goalNumber, increment, block)
		{
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

		Handlebars.registerHelper("abbreviateCharacteristic", function(value)
		{
			switch(value)
			{
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

		Handlebars.registerHelper("renderImages", function(text)
		{
			return PopoutEditor.renderImages(text);
		});
	})
}
