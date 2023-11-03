/** @inheritDoc */
export default class WFRP3eMutationDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;
        const requiredInteger = {nullable: false, required: true};

        return {
            description: new fields.HTMLField(),
            effects: new fields.StringField({...requiredInteger}),
            severityRating: new fields.NumberField({...requiredInteger, initial: 1, integer: true, min: 1}),
            traits: new fields.StringField({...requiredInteger, initial: "Chaos"}),
        };
    }
}