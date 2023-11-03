/** @inheritDoc */
export default class WFRP3eTrappingDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;
        const requiredInteger = {integer: true, nullable: false, required: true};

        return {
            cost: new fields.SchemaField({
                brass: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                silver: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                gold: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
            }),
            description: new fields.HTMLField(),
            encumbrance: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
            rarity: new fields.StringField({initial: "abundant", required: true, nullable: false})
        };
    }
}