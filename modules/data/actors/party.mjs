/**
 * @typedef {Object} PartyEvent
 * @property {string} description
 * @property {number} threshold
 */

/** @inheritDoc */
export default class Party extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			fortunePool: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			members: new fields.ArrayField(new fields.DocumentUUIDField()),
			sockets: new fields.ArrayField(
				new fields.SchemaField({
					item: new fields.DocumentUUIDField({label: "PARTY.FIELDS.sockets.FIELDS.item.label"}),
					type: new fields.StringField({
						choices: {any: "TALENT.TYPES.any", ...CONFIG.WFRP3e.talentTypes, insanity: "TALENT.TYPES.insanity"},
						initial: "focus",
						label: "PARTY.FIELDS.sockets.FIELDS.type.label",
						required: true
					})}, {initial: {item: null, type: "focus"}}
				), {initial: [{item: null, type: "focus"}], label: "PARTY.FIELDS.sockets", required: true}
			),
			specialAbility: new fields.SchemaField({
				description: new fields.HTMLField({nullable : true}),
				title: new fields.StringField({nullable : true})
			}),
			tension: new fields.SchemaField({
				events: new fields.ArrayField(
					new fields.SchemaField({
						description: new fields.HTMLField({
							label: "PARTY.FIELDS.tension.FIELDS.events.FIELDS.description.label",
							nullable: true
						}),
						threshold: new fields.NumberField({
							initial: 4,
							integer: true,
							label: "PARTY.FIELDS.tension.FIELDS.events.FIELDS.threshold.label",
							min: 0,
							nullable: false,
							required: true
						})
					}),
					{initial: [{threshold: 4, effects: ""}, {threshold: 8, effects: ""}]}
				),
				max: new fields.NumberField({
					initial: 8,
					integer: true,
					label: "PARTY.FIELDS.tension.FIELDS.max",
					min: 0,
					nullable: false,
					required: true
				}),
				value: new fields.NumberField({
					initial: 0,
					integer: true,
					label: "PARTY.FIELDS.tension.FIELDS.value",
					min: 0,
					nullable: false,
					required: true
				})
			}),
			traits: new fields.StringField({initial: "Party, , ", nullable: true})
		};
	}

	/** @inheritDoc */
	static migrateData(source)
	{
		source.members?.forEach((member, index) => {
			if(!member.startsWith("Actor."))
				source.members[index] = `Actor.${member}`;
		});

		source.tension?.events.forEach((event, index) => {
			if(!event.description && event.effects)
				source.tension.events[index].description = event.effects;
		});

		return super.migrateData(source);
	}
}
