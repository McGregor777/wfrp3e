import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eActionDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};

        return {
            ...Object.keys(CONFIG.WFRP3e.stances).reduce((object, stance) => {
                object[stance] = new fields.SchemaField({
                    name: new fields.StringField(),
                    art: new fields.FilePathField({categories: ["IMAGE"]}),
                    type: new fields.StringField(),
                    traits: new fields.StringField(),
                    rechargeRating: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                    difficultyModifiers: new fields.SchemaField({
                        challengeDice: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                        misfortuneDice: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                    }),
                    check: new fields.StringField(),
                    requirements: new fields.StringField(),
                    special: new fields.StringField(),
                    uniqueEffect: new fields.StringField(),
                    effects: new fields.SchemaField({
                        ...Object.keys(CONFIG.WFRP3e.symbols).reduce((object, symbol) => {
                            object[symbol] = new fields.ArrayField(
                                new fields.SchemaField({
                                    symbolAmount: new fields.NumberField({...requiredInteger, initial: 1, min: 1}),
                                    description: new fields.HTMLField({required: true})
                                })
                            );

                            return object;
                        }, {})
                    })
                })
                return object;
            }, {}),
            rechargeTokens: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
            type: new fields.StringField()
        };
    }

    /** @inheritDoc */
    prepareBaseData()
    {
        super.prepareBaseData();

        this._prepareEffectDescriptions();
        this._migrateActionType();
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

    _migrateActionType()
    {
        if(!this.type)
            this.updateSource({type: this.conservative.type});
    }
}