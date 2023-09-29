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
					return "CHARACTERISTIC.St";
				case "toughness":
					return "CHARACTERISTIC.To";
				case "agility":
					return "CHARACTERISTIC.Ag";
				case "intelligence":
					return "CHARACTERISTIC.Int";
				case "willpower":
					return "CHARACTERISTIC.WP";
				case "fellowship":
					return "CHARACTERISTIC.Fel";
			}
		});

		Handlebars.registerHelper("renderImages", function(text)
		{
			return PopoutEditor.renderImages(text);
		});
	})
}
