import DataHelper from "../DataHelper.js";

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
				action: new fields.StringField({initial: "", nullable: false, required: true}),
				talent: new fields.StringField({initial: "", nullable: false, required: true}),
				skill: new fields.StringField({initial: "", nullable: false, required: true}),
				wound: new fields.StringField({initial: "", nullable: false, required: true}),
				open: new fields.ArrayField(new fields.StringField(), {initial: new Array(6).fill(""), nullable: false, required: true}),
				careerTransition: new fields.SchemaField({
					cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
					newCareer: new fields.StringField()
				}),
				dedicationBonus: new fields.StringField({initial: "", nullable: false, required: true}),
				nonCareer: new fields.ArrayField(
					new fields.SchemaField({
						cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
						type: new fields.StringField({initial: "", nullable: false, required: true})
					}),
					{initial: new Array(2).fill({cost: 0, type: ""})}
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

		this._prepareDescription();

		const updates = {advances: {}};

		// Ensure there is six open career advances available for each Career.
		if(this.advances.open.length < 6) {
			updates.advances.open = this.advances.open.concat(
				new Array(6 - this.advances.open.length).fill("")
			);
		}

		// Ensure there is no null or undefined values amongst the open career advances.
		this.advances.open.filter(openAdvance => openAdvance == null).map(() => "");

		// Ensure there is two non-career advances available for each Career.
		if(this.advances.nonCareer.length < 2) {
			updates.advances.nonCareer = this.advances.nonCareer.concat(
				new Array(2 - this.advances.nonCareer.length).fill({cost: 0, nature: ""})
			);
		}

		if(updates.advances.open || updates.advances.nonCareer)
			this.updateSource(updates);
	}

	/**
	 * Prepares the description of the Career's description.
	 * @private
	 */
	_prepareDescription()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.description);

		if(cleanedUpDescription)
			this.updateSource({description: cleanedUpDescription});
	}
}