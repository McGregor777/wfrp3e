import WFRP3eTrappingDataModel from "./WFRP3eTrappingDataModel.js";

/** @inheritDoc */
export default class WFRP3eWeaponDataModel extends WFRP3eTrappingDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;
        const requiredInteger = {integer: true, nullable: false, required: true};

        return Object.assign({
            criticalRating: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
            damageRating: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
            group: new fields.StringField({initial: "ordinary", nullable: false, required: true}),
            qualities: new fields.ArrayField(
                new fields.SchemaField({
                    name: new fields.StringField({initial: "attuned", nullable: false, required: true}),
                    rating: new fields.NumberField({initial: 1, integer: true, min: 1})
                })
            ),
            range: new fields.StringField({initial: "close", nullable: false, required: true})
        }, super.defineSchema());
    }
}