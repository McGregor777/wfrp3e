/** @inheritDoc */
export default class WFRP3eAbilityDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;

        return {
            description: new fields.HTMLField()
        };
    }
}