/** @inheritDoc */
export default class WFRP3ePartyDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};

        return {
            fortunePool: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
            members: new fields.ArrayField(new fields.DocumentIdField()),

            specialAbility: new fields.SchemaField({
                title: new fields.StringField(),
                description: new fields.HTMLField()
            }),

            talentSockets: new fields.ArrayField(new fields.StringField(), {initial: ["focus"]}),

            tension: new fields.SchemaField({
                events: new fields.ArrayField(
                    new fields.SchemaField({
                        threshold: new fields.NumberField({...requiredInteger, initial: 4, min: 0}),
                        effects: new fields.HTMLField({required: true})
                    }),
                    {initial: [{threshold: 4, effects: ""}, {threshold: 8, effects: ""}]}
                ),
                maximum: new fields.NumberField({...requiredInteger, initial: 8, min: 0}),
                value: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
            }),

            traits: new fields.StringField({initial: "Party, , "})
        };
    }
}