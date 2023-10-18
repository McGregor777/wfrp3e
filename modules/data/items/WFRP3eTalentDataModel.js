/** @inheritDoc */
export default class WFRP3eTalentDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;

        return {
            description: new fields.HTMLField(),
            rechargeTokens: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
            talentSocket: new fields.StringField(),
            type: new fields.StringField()
        };
    }
}