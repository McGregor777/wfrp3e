import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eActionDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			...Object.keys(CONFIG.WFRP3e.stances).reduce((object, stance) => {
				object[stance] = new fields.SchemaField({
					name: new fields.StringField({label: "ACTION.FIELDS.name.label"}),
					art: new fields.FilePathField({categories: ["IMAGE"], label: "ACTION.FIELDS.art.label"}),
					traits: new fields.StringField({label: "ACTION.FIELDS.traits.label"}),

					rechargeRating: new fields.NumberField({
						integer: true,
						initial: 0,
						label: "ACTION.FIELDS.rechargeRating.label",
						min: 0,
						nullable: false,
						required: true
					}),

					difficultyModifiers: new fields.SchemaField({
						challengeDice: new fields.NumberField({
							integer: true,
							initial: 0,
							label: "ACTION.FIELDS.difficultyModifiers.challengeDice.label",
							min: 0,
							nullable: false,
							required: true
						}),

						misfortuneDice: new fields.NumberField({
							integer: true,
							initial: 0,
							label: "ACTION.FIELDS.difficultyModifiers.misfortuneDice.label",
							min: 0,
							nullable: false,
							required: true
						}),
					}),
					check: new fields.StringField({label: "ACTION.FIELDS.check.label"}),
					requirements: new fields.HTMLField({label: "ACTION.FIELDS.requirements.label"}),
					special: new fields.HTMLField({label: "ACTION.FIELDS.special.label"}),
					uniqueEffect: new fields.HTMLField({label: "ACTION.FIELDS.uniqueEffect.label"}),
					effects: new fields.SchemaField({
						...Object.keys(CONFIG.WFRP3e.symbols).reduce((object, symbol) => {
							object[symbol] = new fields.ArrayField(
								new fields.SchemaField({
									description: new fields.HTMLField({
										label: "ACTION.FIELDS.effects.description.label",
										required: true
									}),

									script: new fields.JavaScriptField({label: "ACTION.FIELDS.effects.script.label"}),
									symbolAmount: new fields.NumberField({
										integer: true,
										initial: 1,
										label: "ACTION.FIELDS.effects.symbolAmount.label",
										min: 1,
										nullable: false,
										required: true
									})
								})
							);
							return object;
						}, {})
					})
				})
				return object;
			}, {}),
			rechargeTokens: new fields.NumberField({integer: true, initial: 0, min: 0, nullable: false, required: true}),
			type: new fields.StringField({
				choices: CONFIG.WFRP3e.actionTypes,
				initial: Object.keys(CONFIG.WFRP3e.actionTypes)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["ACTION"];

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareEffectDescriptions();
	}

	/**
	 * Prepares the descriptions of the Action's effects.
	 * @private
	 */
	_prepareEffectDescriptions()
	{
		const changes = {
			...Object.keys(CONFIG.WFRP3e.stances).reduce((object, stance) => {
				object[stance] = {
					effects: Object.keys(CONFIG.WFRP3e.symbols).reduce((object, symbol) => {
						object[symbol] = this[stance].effects[symbol];
						return object;
					}, {})
				}
				return object;
			}, {})
		};

		Object.keys(CONFIG.WFRP3e.stances).forEach((stance, index) => {
			if(this[stance].special) {
				const newDescription = DataHelper._getCleanedupDescription(this[stance].special);

				if(newDescription)
					changes[stance].special = newDescription;
			}

			if(this[stance].uniqueEffect) {
				const newDescription = DataHelper._getCleanedupDescription(this[stance].uniqueEffect);

				if(newDescription)
					changes[stance].uniqueEffect = newDescription;
			}

			Object.keys(CONFIG.WFRP3e.symbols).forEach((symbol, index) => {
				this[stance].effects[symbol].forEach((effect, index) => {
					const newDescription = DataHelper._getCleanedupDescription(effect.description);

					if(newDescription)
						changes[stance].effects[symbol][index].description = newDescription;
				});
			});
		});

		this.updateSource(changes);
	}
}