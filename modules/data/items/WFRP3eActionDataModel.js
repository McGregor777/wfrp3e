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
            rechargeTokens: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
        };
    }

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
                const newDescription = this._getCleanedupDescription(this[stance].special);

                if(newDescription)
                    changes[stance].special = newDescription;
            }

            if(this[stance].uniqueEffect) {
                const newDescription = this._getCleanedupDescription(this[stance].uniqueEffect);

                if(newDescription)
                    changes[stance].uniqueEffect = newDescription;
            }

            Object.keys(CONFIG.WFRP3e.symbols).forEach((symbol, index) => {
                this[stance].effects[symbol].forEach((effect, index) => {
                    const newDescription = this._getCleanedupDescription(effect.description);

                    if(newDescription)
                        changes[stance].effects[symbol][index].description = newDescription;
                });
            });
        });

        this.updateSource(changes);
    }

    /**
     * Cleans up a description by changing all "[[XXX]]" keywords with the corresponding symbols.
     * @param description {String} The original description.
     * @returns {String|false} The cleaned-up description, or false if the descriptions are identical.
     * @private
     */
    _getCleanedupDescription(description)
    {
        const matches = [...description.matchAll(new RegExp(/\[\[(\w*)]]/, "g"))].reverse();
        let cleanedUpDescription = description;

        matches.forEach((match, index) => {
            const keyword = match[1].toLowerCase();
            let classes = "";

            if(keyword.startsWith("dchar"))
                classes = " dice characteristic";
            else if(keyword.startsWith("dchal"))
                classes = " dice challenge";
            else if(keyword.startsWith("dco"))
                classes = " dice conservative";
            else if(keyword.startsWith("df"))
                classes = " dice fortune";
            else if(keyword.startsWith("de"))
                classes = " dice expertise";
            else if(keyword.startsWith("dm"))
                classes = " dice misfortune";
            else if(keyword.startsWith("dre"))
                classes = " dice reckless";
            else if(keyword.startsWith("bo"))
                classes = " symbol boon";
            else if(keyword.startsWith("ba"))
                classes = " symbol bane";
            else if(keyword.startsWith("ch"))
                classes = " symbol challenge";
            else if(keyword.startsWith("cs"))
                classes = " symbol chaos-star";
            else if(keyword.startsWith("d"))
                classes = " symbol delay";
            else if(keyword.startsWith("e"))
                classes = " symbol exertion";
            else if(keyword.startsWith("rs"))
                classes = " symbol righteous-success";
            else if(keyword.startsWith("su"))
                classes = " symbol success";
            else if(keyword.startsWith("sc"))
                classes = " symbol sigmars-comet";

            cleanedUpDescription = cleanedUpDescription.slice(0, match.index) +
                '<span class="wfrp3e-font' + classes + '"></span>' +
                cleanedUpDescription.slice(match.index + match[0].length, cleanedUpDescription.length);
        });

        if(cleanedUpDescription === description)
            return false;

        return cleanedUpDescription;
    }
}