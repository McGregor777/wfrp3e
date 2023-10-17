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
            defenceValue: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
            soakValue: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
        }, super.defineSchema());
    }
}