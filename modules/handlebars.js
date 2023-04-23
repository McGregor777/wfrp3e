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

		Handlebars.registerHelper("diceSymbols", function(text)
		{
			return PopoutEditor.renderDiceImages(text);
		});

		Handlebars.registerHelper("times", function(number, block)
		{
			let accum = "";

			for(let i = 0; i < number; i++)
				accum += block.fn(i);

			return accum;
		});

		Handlebars.registerHelper("array", function(length)
		{
			return Array.from({length: length}, (element, index) => index);
		});

		Handlebars.registerHelper("format", function(localizationKey, parameters)
		{
			return game.i18n.format(localizationKey, parameters.hash);
		});
	})
}
