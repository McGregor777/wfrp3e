import Item from "./item.mjs";

/** @inheritDoc */
export default class Career extends Item
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
						any: "RACE.any",
						...Object.entries(CONFIG.WFRP3e.availableRaces).reduce((choices, [key, value]) => {
							choices[key] = value.name
							return choices;
						}, {})
					},
					initial: "any",
					required: true
				}),
				{initial: ["any"], required: true}),
			sockets: new fields.ArrayField(
				new fields.SchemaField({
					item: new fields.DocumentUUIDField(),
					type: new fields.StringField({
						choices: {any: "TALENT.TYPES.any", ...CONFIG.WFRP3e.talentTypes, insanity: "TALENT.TYPES.insanity"},
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

	/**
	 * The number of open advances of each type contained by a career.
	 * @private
	 */
	get openAdvanceTypeNumbers()
	{
		return Object.entries({
			action: `${game.i18n.localize("CAREER.SHEET.action")} -`,
			talent: `${game.i18n.localize("CAREER.SHEET.talent")} -`,
			skill: [
				game.i18n.format("SKILLUPGRADER.acquisitionUpgrade", {name: ""}),
				game.i18n.format("SKILLUPGRADER.specialisationUpgrade", {name: "", value: ""}),
				game.i18n.format("SKILLUPGRADER.trainingLevelUpgrade", {name: "", value: ""})
			],
			fortune: game.i18n.format("CHARACTERISTICUPGRADER.characteristicFortune", {characteristic: ""}),
			conservative: game.i18n.localize("STANCES.conservative"),
			reckless: game.i18n.localize("STANCES.reckless"),
			wound: game.i18n.localize("CHARACTER.woundThreshold")
		}).reduce((types, [key, value]) => {
			console.log(value)

			types[key] = 0;

			if(Array.isArray(value))
				for(const val of value)
					types[key] += this.advances.open.filter(advance => advance && advance.includes(val)).length
			else
				types[key] = this.advances.open.filter(advance => advance && advance.includes(value)).length;

			return types;
		}, {});
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
}
