export default function ()
{
    Hooks.on("init", () =>
	{
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

		Handlebars.registerHelper("times", function(n, block)
		{
			var accum = "";

			for(let i = 0; i < n; i++)
				accum += block.fn(i);

			return accum;
		});
	})
}
