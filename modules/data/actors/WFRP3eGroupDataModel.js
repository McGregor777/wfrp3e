import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eGroupDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;

        return {
            specialAbilities: new fields.ArrayField(
                new fields.SchemaField({
                    title: new fields.StringField(),
                    description: new fields.HTMLField(),
                    values: new fields.ArrayField(new fields.SchemaField({
						content: new fields.StringField(),
						trigger: new fields.BooleanField()
					})),
                    current: new fields.NumberField({initial: 0, integer: true, nullable: false, required: true})
                }), {
					initial: new Array(2).fill({
						title: game.i18n.localize("GROUP.SPECIALABILITY.Title"),
						description: game.i18n.localize("GROUP.SPECIALABILITY.Description"),
						values: [{
							content: "0",
							trigger: false
						}, {
							content: "1",
							trigger: false
						}, {
							content: "2",
							trigger: false
						}, {
							content: "3",
							trigger: false
						}, {
							content: "4",
							trigger: true
						}, {
							content: "5",
							trigger: false
						}, {
							content: "6",
							trigger: false
						}, {
							content: "7",
							trigger: false
						}, {
							content: "8",
							trigger: true
						}],
						current: 0
					})
                }),

            talentSockets: new fields.ArrayField(new fields.StringField(), {initial: ["focus"]}),
        };
    }

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareSpecialAbilitiesDescription();
	}

	/**
	 * Prepares the descriptions of the Special Abilities.
	 * @private
	 */
	_prepareSpecialAbilitiesDescription()
	{
		const updates = {specialAbilities: this.specialAbilities};

		this.specialAbilities.forEach((specialAbility, index) => {
			updates.specialAbilities[index].description = DataHelper._getCleanedupDescription(specialAbility.description);

			specialAbility.values.forEach((value, index2) => {
				updates.specialAbilities[index].values[index2].content = DataHelper._getCleanedupDescription(value.content)
			});
		});

		this.updateSource(updates);
	}
}