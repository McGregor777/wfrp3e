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
				open: new fields.ArrayField(new fields.StringField(), {
					initial: new Array(6).fill(""),
					max: 6,
					min: 6,
					nullable: false,
					required: true
				}),
				careerTransition: new fields.SchemaField({
					cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
					newCareer: new fields.StringField()
				}),
				dedicationBonus: new fields.StringField({initial: "", nullable: false, required: true}),
				nonCareer: new fields.ArrayField(
					new fields.SchemaField({
						cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
						type: new fields.StringField({initial: "", nullable: false, required: true})
					}), {
					initial: new Array(2).fill({cost: 0, type: ""}),
					max: 2,
					min: 2
				})
			}),
			careerSkills: new fields.StringField({initial: ", , , , ", required: true}),
			current: new fields.BooleanField(),
			description: new fields.HTMLField(),
			primaryCharacteristics: new fields.ArrayField(
				new fields.StringField({
					choices: Object.entries(CONFIG.WFRP3e.characteristics).reduce((choices, [key, value]) => {
						choices[key] = value.name
						return choices;
					}, {}),
					initial: "strength",
					required: true
				}),
				{initial: ["strength", "agility"], required: true}
			),
			raceRestrictions: new fields.ArrayField(
				new fields.StringField({
					choices: {
						any: "RACE.Any",
						...Object.entries(CONFIG.WFRP3e.availableRaces).reduce((choices, [key, value]) => {
							choices[key] = value.name
							return choices;
						}, {})
					},
					initial: "any",
					required: true
				}),
				{initial: ["any"], required: true}
			),
			sockets: new fields.ArrayField(
				new fields.SchemaField({
					item: new fields.DocumentUUIDField({label: "CAREER.FIELDS.sockets.FIELDS.item.label"}),
					type: new fields.StringField({
						choices: {any: "TALENT.TYPES.any", ...CONFIG.WFRP3e.talentTypes, insanity: "TALENT.TYPES.insanity"},
						initial: "focus",
						label: "CAREER.FIELDS.sockets.FIELDS.type.label",
						required: true
					})}, {initial: {item: null, type: "focus"}}
				), {
					initial: new Array(2).fill({item: null, type: "focus"}),
					label: "CAREER.FIELDS.sockets",
					required: true
				}),
			traits: new fields.StringField({initial: ", , , ", required: true}),
			startingStance: new fields.SchemaField({
				conservativeSegments: new fields.NumberField({initial: 2, integer: true, min: 0, nullable: false, required: true}),
				recklessSegments: new fields.NumberField({initial: 2, integer: true, min: 0, nullable: false, required: true})
			}),
			summary: new fields.StringField(),
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["CAREER"];

	/** @inheritDoc */
	static cleanData(source = {}, options = {})
	{
		if(source.advances?.open?.length < 6)
			source.advances.open.push(
				new Array(6 - source.advances.open.length).fill({cost: 0, type: ""})
			);
		else if(source.advances?.open?.length > 6)
			source.advances.open = source.advances.open.slice(0, 6);

		if(source.advances?.nonCareer?.length < 2)
			source.advances.nonCareer.push(
				new Array(2 - source.advances.nonCareer.length).fill({cost: 0, type: ""})
			);
		else if(source.advances?.nonCareer?.length > 2)
			source.advances.nonCareer = source.advances.nonCareer.slice(0, 2);

		if(source.raceRestrictions?.length === 1) {
			const raceRestrictionKeys = ["any", ...Object.keys(CONFIG.WFRP3e.availableRaces)];

			if(!raceRestrictionKeys.includes(source.raceRestrictions[0])) {
				const match = source.raceRestrictions[0].match(new RegExp(/^\w*/));
				source.raceRestrictions[0] = match[0].toLowerCase();
			}
		}

		return this.schema.clean(source, options);
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDescription()
	}

	/** @inheritDoc */
	static migrateData(source)
	{
		if(source.talentSockets)
			source.talentSockets.forEach((talentSocket, index) => {
				source.sockets[index] === undefined
					? source.sockets.push({item: null, type: talentSocket})
					: source.sockets[index].type = talentSocket;
			});

		return super.migrateData(source);
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