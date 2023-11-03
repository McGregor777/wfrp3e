/** @inheritDoc */
export default class WFRP3eCareerDataModel extends foundry.abstract.TypeDataModel
{
    /** @inheritDoc */
    static defineSchema()
    {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};

        return {
            advanced: new fields.BooleanField(),
            advanceOptions: new fields.SchemaField({
                action: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                conservative: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                fortune: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                reckless: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                skill: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                talent: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                wound: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
            }),
            advances: new fields.SchemaField({
                action: new fields.StringField(),
                careerTransition: new fields.SchemaField({
                    cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
                    newCareer: new fields.StringField()
                }),
                dedicationBonus: new fields.StringField(),
                nonCareer: new fields.ArrayField(
                    new fields.SchemaField({
                        cost: new fields.NumberField({initial: 0, integer: true, min: 0}),
                        nature: new fields.StringField()
                    }),
                    {initial: [{cost: 0, nature: ""}, {cost: 0, nature: ""}]}
                ),
                open: new fields.ArrayField(new fields.StringField()),
                skill: new fields.StringField(),
                talent: new fields.StringField(),
                wound: new fields.StringField()
            }),
            careerSkills: new fields.StringField({initial: ", , , , ", required: true}),
            completed: new fields.BooleanField(),
            current: new fields.BooleanField(),
            description: new fields.HTMLField(),
            primaryCharacteristics: new fields.ArrayField(new fields.StringField(), {initial: ["strength", "ability"], required: true}),
            raceRestrictions: new fields.StringField({required: true}),
            talentSockets: new fields.ArrayField(new fields.StringField(), {initial: ["focus", "focus"], required: true}),
            traits: new fields.StringField({initial: ", , , ", required: true}),
            startingStance: new fields.SchemaField({
                conservativeSegments: new fields.NumberField({...requiredInteger, initial: 2, min: 0}),
                recklessSegments: new fields.NumberField({...requiredInteger, initial: 2, min: 0})
            }),
            summary: new fields.StringField(),
        };
    }
}