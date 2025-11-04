import Item from "./item.mjs";

/** @inheritDoc */
export default class Skill extends Item
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  characteristicsData = wfrp3e.data.actors.Actor.CHARACTERISTICS,
			  characteristics = {};

		for(const [key, characteristic] of Object.entries(characteristicsData))
			characteristics[key] = characteristic.name;

		return {
			advanced: new fields.BooleanField(),
			characteristic: new fields.StringField({
				choices: {...characteristics, varies: "ACTOR.FIELDS.characteristics.varies.label"},
				initial: Object.keys(characteristicsData)[0],
				required: true
			}),
			description: new fields.HTMLField(),
			specialisations: new fields.StringField(),
			trainingLevel: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["SKILL"];
}
