/** @inheritDoc */
export default class WFRP3eConditionDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;

        return {
            description: new fields.HTMLField(),
            duration: new fields.StringField({initial: "brief", required: true, nullable: false})
        };
    }
}