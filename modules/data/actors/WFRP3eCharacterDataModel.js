/** @inheritDoc */
export default class WFRP3eCharacterDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};

        return {
            attributes: new fields.SchemaField({
                characteristics: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
                    if(characteristic !== "varies")
                        object[characteristic] = new fields.SchemaField({
                            value: new fields.NumberField({...requiredInteger, initial: 2, min: 0}),
                            fortune: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                        }, {label: characteristic});

                    return object;
                }, {})),
                corruption: new fields.SchemaField({
                    threshold: new fields.NumberField({...requiredInteger, initial: 5, min: 0}),
                    value: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                }),
                fortune: new fields.SchemaField({
                    maximum: new fields.NumberField({...requiredInteger, initial: 3, min: 0}),
                    value: new fields.NumberField({...requiredInteger, initial: 3, min: 0})
                }),
                stance: new fields.SchemaField({
                    ...Object.keys(CONFIG.WFRP3e.stances).reduce((object, stance) => {
                        object[stance] = new fields.NumberField({...requiredInteger, initial: 0, min: 0});
                        return object;
                    }, {}),
                    current: new fields.NumberField({...requiredInteger, initial: 0})
                }),
                wounds: new fields.SchemaField({
                    threshold: new fields.NumberField({...requiredInteger, initial: 7, min: 0}),
                    value: new fields.NumberField({...requiredInteger, initial: 7, min: 0})
                })
            }),
            background: new fields.SchemaField({
                biography: new fields.HTMLField(),
                height: new fields.StringField(),
                weight: new fields.StringField(),
                build: new fields.StringField(),
                hairColour: new fields.StringField(),
                eyeColour: new fields.StringField(),
                birthplace: new fields.StringField(),
                familyMembers: new fields.StringField(),
                personalGoal: new fields.StringField(),
                allies: new fields.StringField(),
                enemies: new fields.StringField(),
                campaignNotes: new fields.StringField()
            }),
            characteristics: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
                if(characteristic !== "varies")
                    object[characteristic] = new fields.SchemaField({
                        value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
                        fortune: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
                    }, {label: characteristic});

                return object;
            }, {})),
            corruption: new fields.SchemaField({
                max: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
                value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
            }),
            experience: new fields.SchemaField({
                current: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
                spent: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
            }),
            fortune: new fields.SchemaField({
                max: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
                value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
            }),
            impairments: new fields.SchemaField({
                fatigue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
                stress: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
            }),
            party: new fields.DocumentIdField(),
            race: new fields.StringField({initial: "none", nullable: false, required: true}),
            stance: new fields.SchemaField({
                ...Object.keys(CONFIG.WFRP3e.stances).reduce((object, stance) => {
                    object[stance] = new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true});
                    return object;
                }, {}),
                current: new fields.NumberField({initial: 0, integer: true, nullable: false, required: true})
            }),
            wounds: new fields.SchemaField({
                max: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true}),
                value: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true})
            })
        };
    }

    /** @inheritDoc */
    prepareDerivedData()
    {
        this._getCurrentCareer();
        this._getParty();

        this._prepareDefence();
        this._prepareEncumbrance();
        this._prepareSoak();
        this._prepareStanceMeter();

        this._prepareDefaultStance();
    }

    /** @inheritDoc */
    static migrateData(source)
    {
        Object.keys(CONFIG.WFRP3e.characteristics).forEach((characteristic) => {
            if(!source.characteristics[characteristic].value)
                source.characteristics[characteristic].value = source.attributes.characteristics[characteristic].value;

            if(!source.characteristics[characteristic].fortune)
                source.characteristics[characteristic].fortune = source.attributes.characteristics[characteristic].fortune;
        });

        if(!source.corruption.max)
            source.corruption.max = source.attributes.corruption.threshold;

        if(!source.corruption.value)
            source.corruption.value = source.attributes.corruption.value;

        if(!source.fortune.max)
            source.fortune.max = source.attributes.fortune.maximum;

        if(!source.fortune.value)
            source.fortune.value = source.attributes.fortune.value;

        if(!source.stance.conservative)
            source.stance.conservative = source.attributes.stance.conservative;

        if(!source.stance.reckless)
            source.stance.reckless = source.attributes.stance.reckless;

        if(!source.stance.current)
            source.stance.current = source.attributes.stance.current;

        if(!source.wounds.max)
            source.wounds.max = source.attributes.wounds.threshold;

        if(!source.wounds.value)
            source.wounds.value = source.attributes.wounds.value;

        return super.migrateData(source);
    }

    /**
     * Gets the current WFRP3eCareer of the WFRP3eCharacter.
     * @private
     */
    _getCurrentCareer()
    {
        this.currentCareer = this.parent.itemTypes.career.find(career => career.system.current === true);
    }

    /**
     * Gets the WFRP3eParty of the WFRP3eCharacter.
     * @private
     */
    _getParty()
    {
        this.currentParty = game.actors.contents.find(actor => actor.id === this.party);
    }

    /**
     * Prepares the total defence of the WFRP3eCharacter.
     * @private
     */
    _prepareDefence()
    {
        this.totalDefence = this.parent.itemTypes.armour.reduce((totalDefence, armour) => totalDefence + armour.system.defenceValue, 0);
    }

    /**
     * Prepares the total encumbrance of the WFRP3eCharacter.
     * @private
     */
    _prepareEncumbrance()
    {
        this.totalEncumbrance = this.parent.items
            .filter((item) => ["armour", "trapping", "weapon"].includes(item.type))
            .reduce((totalEncumbrance, item) => totalEncumbrance + item.system.encumbrance, 0);
    }

    /**
     * Prepares the total soak of the WFRP3eCharacter.
     * @private
     */
    _prepareSoak()
    {
        this.totalSoak = this.parent.itemTypes.armour.reduce((totalSoak, armour) => totalSoak + armour.system.soakValue, 0);
    }

    /**
     * Prepares the stance meter of the WFRP3eCharacter.
     * @private
     */
    _prepareStanceMeter()
    {
        this.stanceMeter = {
            conservative: -this.stance.conservative - (this.parent.system.currentCareer?.system.startingStance.conservativeSegments ?? 0),
            reckless: this.stance.reckless + (this.parent.system.currentCareer?.system.startingStance.recklessSegments ?? 0)
        };
    }

    /**
     * Prepares the default stance of the WFRP3eCharacter.
     * @private
     */
    _prepareDefaultStance()
    {
        this.defaultStance = "conservative";

        if(this.stance.current > 0 ||
            this.stance.current === 0 && Math.abs(this.stanceMeter.conservative) < this.stanceMeter.reckless) {
            this.defaultStance = "reckless";
        }
    }
}