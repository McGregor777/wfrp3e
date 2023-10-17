/** @inheritDoc */
export default class WFRP3eMiscastDataModel extends foundry.abstract.TypeDataModel
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