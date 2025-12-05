/** @inheritDoc */
export default class Group extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			specialAbilities: new fields.ArrayField(
				new fields.SchemaField({
					current: new fields.NumberField({
						integer: true,
						label: "GROUP.FIELDS.specialAbilities.FIELDS.current.label",
						nullable: false,
						required: true
					}),
					description: new fields.HTMLField({
						label: "GROUP.FIELDS.specialAbilities.FIELDS.description.label",
						nullable: true
					}),
					title: new fields.StringField({
						label: "GROUP.FIELDS.specialAbilities.FIELDS.title.label",
						nullable: true
					}),
					values: new fields.ArrayField(
						new fields.SchemaField({
							content: new fields.StringField({
								label: "GROUP.FIELDS.specialAbilities.FIELDS.values.FIELDS.content.label",
								nullable: true
							}),
							trigger: new fields.BooleanField({
								label: "GROUP.FIELDS.specialAbilities.FIELDS.values.FIELDS.trigger.label"
							})
						})
					)
				}), {
				initial: new Array(2).fill({
					current: 0,
					description: game.i18n.localize("GROUP.FIELDS.specialAbilities.FIELDS.description.label"),
					title: game.i18n.localize("GROUP.FIELDS.specialAbilities.FIELDS.title.label"),
					values: [
						{content: "0", trigger: false},
						{content: "1", trigger: false},
						{content: "2", trigger: false},
						{content: "3", trigger: false},
						{content: "4", trigger: true},
						{content: "5", trigger: false},
						{content: "6", trigger: false},
						{content: "7", trigger: false},
						{content: "8", trigger: true}
					]
				}),
				label: "GROUP.FIELDS.specialAbilities.label", required: true
			}),
			sockets: new fields.ArrayField(
				new fields.SchemaField({
					item: new fields.DocumentUUIDField({label: "GROUP.FIELDS.sockets.FIELDS.item.label"}),
					type: new fields.StringField({
						choices: {any: "TALENT.TYPES.any", ...wfrp3e.data.items.Talent.TYPES, insanity: "TALENT.TYPES.insanity"},
						initial: "focus",
						label: "GROUP.FIELDS.sockets.FIELDS.type.label",
						required: true
					})}, {initial: {item: null, type: "focus"}}
				), {initial: [{item: null, type: "focus"}], label: "GROUP.FIELDS.sockets", required: true}
			),
		};
	}
}
