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
			return value + valueToAdd;
		});

		Handlebars.registerHelper("characteristicToAbbreviation", function(value)
		{
			switch(value)
			{
				case "strength":
					return "St";
				case "toughness":
					return "To";
				case "agility":
					return "Ag";
				case "intelligence":
					return "Int";
				case "willpower":
					return "WP";
				case "fellowship":
					return "Fel";
			}
		});

		Handlebars.registerHelper("renderImages", function(text)
		{
			return PopoutEditor.renderImages(text);
		});

		Handlebars.registerHelper("for", function(startingNumber, goalNumber, increment, block)
		{
			let accum = "";

			if(startingNumber <= goalNumber) {
				if(increment < 1)
					throw new Error("Increment cannot be inferior to 1 if the starting number is inferior or equal to the goal number");

				for(let i = startingNumber; i <= goalNumber; i += increment)
					accum += block.fn(i);
			}
			else {
				if(increment > -1)
					throw new Error("Increment cannot be superior to -1 if the starting number is superior to the goal number");

				for(let i = startingNumber; i >= goalNumber; i += increment)
					accum += block.fn(i);
			}

			return accum;
		});

		Handlebars.registerHelper("array", function(length)
		{
			return Array.from({length: length}, (element, index) => index);
		});
	})
}
