/** @inheritDoc */
export default class WFRP3ePartyDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			fortunePool: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			members: new fields.ArrayField(new fields.DocumentIdField()),
			sockets: new fields.ArrayField(
				new fields.SchemaField({
					item: new fields.DocumentUUIDField(),
					type: new fields.StringField({
						choices: {any: "TALENT.TYPES.any", ...CONFIG.WFRP3e.talentTypes, insanity: "TALENT.TYPES.insanity"},
						initial: "any",
						required: true
					})}, {initial: {item: null, type: "any"}}),
				{initial: [{item: null, type: "any"}], required: true}
			),
			specialAbility: new fields.SchemaField({
				title: new fields.StringField(),
				description: new fields.HTMLField()
			}),
			tension: new fields.SchemaField({
				events: new fields.ArrayField(
					new fields.SchemaField({
						threshold: new fields.NumberField({initial: 4, integer: true, min: 0, nullable: false, required: true}),
						effects: new fields.HTMLField({required: true})
					}),
					{initial: [{threshold: 4, effects: ""}, {threshold: 8, effects: ""}]}
				),
				maximum: new fields.NumberField({initial: 8, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			traits: new fields.StringField({initial: "Party, , "})
		};
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