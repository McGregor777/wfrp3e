import Item from "./item.mjs";

/** @inheritDoc */
export default class Career extends Item
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  characteristics = {},
			  races = {}

		for(const [key, characteristic] of Object.entries(CONFIG.WFRP3e.characteristics))
			characteristics[key] = characteristic.name;

		for(const [key, race] of Object.entries(CONFIG.WFRP3e.availableRaces))
			races[key] = race.name;

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
				action: new fields.StringField({nullable: true}),
				talent: new fields.StringField({nullable: true}),
				skill: new fields.StringField({nullable: true}),
				wound: new fields.StringField({nullable: true}),
				open: new fields.ArrayField(
					new fields.StringField({nullable: true}), {
						initial: new Array(6),
						max: 6,
						min: 6,
						nullable: false,
						required: true
					}
				),
				careerTransition: new fields.SchemaField({
					cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
					newCareer: new fields.StringField({nullable: true})
				}),
				dedicationBonus: new fields.StringField({nullable: true}),
				nonCareer: new fields.ArrayField(
					new fields.SchemaField({
						cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
						type: new fields.StringField({nullable: true})
					}), {
					initial: new Array(2).fill({cost: 0, type: null}),
					max: 2,
					min: 2
				})
			}),
			careerSkills: new fields.StringField({initial: ", , , , ", required: true}),
			current: new fields.BooleanField(),
			description: new fields.HTMLField(),
			primaryCharacteristics: new fields.ArrayField(
				new fields.StringField({
					choices: characteristics,
					initial: "strength",
					required: true
				}),
				{initial: ["strength", "agility"], required: true}
			),
			raceRestrictions: new fields.ArrayField(
				new fields.StringField({
					choices: {any: "RACE.any", ...races},
					initial: "any",
					required: true
				}),
				{initial: ["any"], required: true}),
			sockets: new fields.ArrayField(
				new fields.SchemaField({
					item: new fields.DocumentUUIDField(),
					type: new fields.StringField({
						choices: {any: "TALENT.TYPES.any", ...wfrp3e.data.items.Talent.TYPES, insanity: "TALENT.TYPES.insanity"},
						initial: "focus",
						required: true
					})}, {initial: {item: null, type: "focus"}}
				), {
					initial: new Array(2).fill({item: null, type: "focus"}),
					label: "CAREER.FIELDS.sockets",
					required: true
				}
			),
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
	static migrateData(source)
	{
		if(source.talentSockets)
			for(const index in source.talentSockets) {
				const oldSocket = source.talentSockets[index];

				source.sockets[index] === undefined
					? source.sockets.push({item: null, type: oldSocket})
					: source.sockets[index].type = oldSocket;
			}

		return super.migrateData(source);
	}

	//#TODO Add a "type" property to open advances so an open advance type doesn't require to be guessed anymore.
	//#TODO Reverse the logic by returning the number of open advance still available by type.
	/**
	 * The number of open advances of each type that has been bought during a career.
	 * @private
	 */
	get openAdvanceTypeNumbers()
	{
		const advanceTypeLabels = {
				  action: game.i18n.localize("CAREER.SHEET.action"),
				  talent: game.i18n.localize("CAREER.SHEET.talent"),
				  skill: [
					  game.i18n.format("SKILLUPGRADER.acquisitionUpgrade", {name: ""}),
					  game.i18n.format("SKILLUPGRADER.specialisationUpgrade", {name: "", value: ""}),
					  game.i18n.format("SKILLUPGRADER.trainingLevelUpgrade", {name: "", value: ""})
				  ],
				  fortune: game.i18n.format("CHARACTERISTICUPGRADER.characteristicFortune", {characteristic: ""}),
				  conservative: game.i18n.localize("STANCES.conservative"),
				  reckless: game.i18n.localize("STANCES.reckless"),
				  wound: game.i18n.localize("CHARACTER.woundThreshold")
			  },
			  advancesBought = {};

		// Each open advance label is tested in order to determine which type of open advance it is.
		// For example, if an open advance is labelled "Education - Acquisition", then we know that it is
		// a skill open advance and that there is minus one skill advance left to be taken as an open advance.
		for(const [key, label] of Object.entries(advanceTypeLabels)) {
			advancesBought[key] = 0;

			// Skill advances come in different form of upgrades, so each form has to be tested.
			if(Array.isArray(label))
				for(const val of label)
					advancesBought[key] += this.advances.open.filter(advance => advance?.includes(label)).length
			else
				advancesBought[key] = this.advances.open.filter(advance => advance?.includes(label)).length;
		}

		return advancesBought;
	}
}
