/** @inheritDoc */
export default class WFRP3eCareerDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			advanced: new fields.BooleanField(),
			advanceOptions: new fields.SchemaField({
				action: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				talent: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				skill: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				fortune: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				conservative: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				reckless: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				wound: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			advances: new fields.SchemaField({
				action: new fields.StringField(),
				talent: new fields.StringField(),
				skill: new fields.StringField(),
				wound: new fields.StringField(),
				open: new fields.ArrayField(new fields.StringField(), {initial: new Array(6).fill("")}),
				careerTransition: new fields.SchemaField({
					cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
					newCareer: new fields.StringField()
				}),
				dedicationBonus: new fields.StringField(),
				nonCareer: new fields.ArrayField(
					new fields.SchemaField({
						cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
						type: new fields.StringField()
					}),
					{initial: new Array(2).fill({cost: 0, nature: ""})}
				)
			}),
			careerSkills: new fields.StringField({initial: ", , , , ", required: true}),
			current: new fields.BooleanField(),
			description: new fields.HTMLField(),
			primaryCharacteristics: new fields.ArrayField(new fields.StringField(), {initial: ["strength", "ability"], required: true}),
			raceRestrictions: new fields.ArrayField(new fields.StringField(), {initial: ["any"], required: true}),
			talentSockets: new fields.ArrayField(new fields.StringField(), {initial: ["focus", "focus"], required: true}),
			traits: new fields.StringField({initial: ", , , ", required: true}),
			startingStance: new fields.SchemaField({
				conservativeSegments: new fields.NumberField({initial: 2, integer: true, min: 0, nullable: false, required: true}),
				recklessSegments: new fields.NumberField({initial: 2, integer: true, min: 0, nullable: false, required: true})
			}),
			summary: new fields.StringField(),
		};
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		const updates = {advances: {}};

		// Ensure there is six open career advances available for each Career.
		if(this.advances.open.length < 6) {
			updates.advances.open = this.advances.open.concat(
				new Array(6 - this.advances.open.length).fill("")
			);
		}

		// Ensure there is two non-career advances available for each Career.
		if(this.advances.nonCareer.length < 2) {
			updates.advances.nonCareer = this.advances.nonCareer.concat(
				new Array(2 - this.advances.nonCareer.length).fill({cost: 0, nature: ""})
			);
		}

		if(updates.advances.open || updates.advances.nonCareer)
			this.updateSource(updates);
	}

	/** @inheritDoc */
	static migrateData(source)
	{
		if(!(source.raceRestrictions instanceof Array)) {
			const raceRestrictions = source.raceRestrictions.replaceAll(" ", "").toLowerCase();

			if(raceRestrictions.includes("any"))
				source.raceRestrictions = ["any"];
			else {
				source.raceRestrictions = [];

				if(raceRestrictions.includes("human"))
					source.raceRestrictions.push("human");

				if(raceRestrictions.includes("dwarf"))
					source.raceRestrictions.push("dwarf");

				if(raceRestrictions.includes("highelf"))
					source.raceRestrictions.push("highElf");

				if(raceRestrictions.includes("woodelf"))
					source.raceRestrictions.push("woodElf");
			}
		}

		return super.migrateData(source);
	}
}