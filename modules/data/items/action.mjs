/**
 * @typedef {Object} ActionEffect
 * @property {string} description The description of the action effect.
 * @property {string} immediate Whether the script must be executed immediately whenever the action effect is toggled on.
 * @property {string} reverseScript If the action effect is set to immediately execute its script when toggled on,
 * 									when the action effect is toggled off, the reverse script is executed to cancel
 * 									the effects of the script.
 * @property {number} symbolAmount The number of symbols to spend to toggle the action effect.
 * @property {string} script The script of the action effect.
 */

/** @inheritDoc */
export default class Action extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  faces = {};

		for(const face of Object.keys(wfrp3e.data.actors.Actor.STANCES)) {
			const effects = {};
			for(const symbol of Object.keys(CONFIG.WFRP3e.symbols))
				effects[symbol] = new fields.ArrayField(
					new fields.SchemaField({
						description: new fields.HTMLField({
							label: "ACTION.FIELDS.effects.description.label",
							required: true
						}),
						immediate: new fields.BooleanField({
							label: "ACTION.FIELDS.effects.immediate.label",
							hint: "ACTION.FIELDS.effects.immediate.hint"
						}),
						reverseScript: new fields.JavaScriptField({
							async: true,
							label: "ACTION.FIELDS.effects.reverseScript.label",
							hint: "ACTION.FIELDS.effects.reverseScript.hint"
						}),
						script: new fields.JavaScriptField({
							async: true,
							label: "ACTION.FIELDS.effects.script.label",
							hint: "ACTION.FIELDS.effects.script.hint"
						}),
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

			faces[face] = new fields.SchemaField({
				name: new fields.StringField({
					label: "ACTION.FIELDS.name.label",
					textSearch: true
				}),
				art: new fields.FilePathField({categories: ["IMAGE"], label: "ACTION.FIELDS.art.label"}),
				traits: new fields.StringField({
					label: "ACTION.FIELDS.traits.label",
					textSearch: true
				}),
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
				check: new fields.StringField({
					label: "ACTION.FIELDS.check.label",
					textSearch: true
				}),
				requirements: new fields.HTMLField({
					label: "ACTION.FIELDS.requirements.label",
					textSearch: true
				}),
				special: new fields.HTMLField({label: "ACTION.FIELDS.special.label"}),
				uniqueEffect: new fields.HTMLField({label: "ACTION.FIELDS.uniqueEffect.label"}),
				effects: new fields.SchemaField(effects)
			});
		}

		return {
			...faces,
			rechargeTokens: new fields.NumberField({integer: true, initial: 0, min: 0, nullable: false, required: true}),
			type: new fields.StringField({
				choices: this.TYPES,
				initial: Object.keys(this.TYPES)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["ACTION"];
	
	static TYPES = {
		melee: "ACTION.TYPES.melee",
		ranged: "ACTION.TYPES.ranged",
		support: "ACTION.TYPES.support",
		blessing: "ACTION.TYPES.blessing",
		spell: "ACTION.TYPES.spell"
	};
}
