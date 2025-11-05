import Actor from "./actor.mjs";

/** @inheritDoc */
export default class Character extends Actor
{
	static {
		this.LOCALIZATION_PREFIXES.push("CHARACTER");
	}

	static RACES = {
		human: {
			art: "systems/wfrp3e/assets/images/races/empire.webp",
			creationPoints: 25,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 2,
				intelligence: 2,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.human",
			origins: {
				reiklander: {
					abilities: [
						"Compendium.wfrp3e.items.Item.vsdlb2SFSFDnt4r6",
						"Compendium.wfrp3e.items.Item.gToY5Bonw9mAVzkU",
						"Compendium.wfrp3e.items.Item.ppkk6UNuhTnGqrY6"
					],
					art: "systems/wfrp3e/assets/images/races/empire.webp",
					corruption: 5,
					introduction: "ORIGIN.reiklander.introduction",
					name: "ORIGIN.reiklander.name",
					wound: 9
				}
			},
			startingCareerRollTableUuid: "Compendium.wfrp3e.roll-tables.PoY76It3s6IkTr3g"
		},
		dwarf: {
			art: "systems/wfrp3e/assets/images/races/dwarf.webp",
			creationPoints: 20,
			defaultRatings: {
				strength: 3,
				toughness: 3,
				agility: 2,
				intelligence: 2,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.dwarf",
			origins: {
				karakAzgaraz: {
					abilities: [
						"Compendium.wfrp3e.items.Item.1LsUZDU1mnADiZyh",
						"Compendium.wfrp3e.items.Item.ATznsFp414qzofcJ",
						"Compendium.wfrp3e.items.Item.5zLg7T9FTNvgtJp1",
						"Compendium.wfrp3e.items.Item.VHiON3EQ7VMe41jT"
					],
					art: "systems/wfrp3e/assets/images/races/dwarf.webp",
					corruption: 10,
					introduction: "ORIGIN.karakAzgaraz.introduction",
					name: "ORIGIN.karakAzgaraz.name",
					wound: 10
				}
			},
			startingCareerRollTableUuid: "Compendium.wfrp3e.roll-tables.RollTable.Clr8Gwsfs7VkMFjd"
		},
		highElf: {
			art: "systems/wfrp3e/assets/images/races/high_elf.webp",
			creationPoints: 20,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 3,
				intelligence: 3,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.highElf",
			origins: {
				ulthuan: {
					abilities: [
						"Compendium.wfrp3e.items.Item.tJc6iH8pOllVO9Go",
						"Compendium.wfrp3e.items.Item.h0pAI8aricmNHCke",
						"Compendium.wfrp3e.items.Item.zvzzGw8UBrM5GNfL",
						"Compendium.wfrp3e.items.Item.VHiON3EQ7VMe41jT"
					],
					art: "systems/wfrp3e/assets/images/races/high_elf.webp",
					corruption: 10,
					introduction: "ORIGIN.ulthuan.introduction",
					name: "ORIGIN.ulthuan.name",
					wound: 8
				}
			},
			startingCareerRollTableUuid: "Compendium.wfrp3e.roll-tables.tJU9IvQGkcIIBPce"
		},
		woodElf: {
			art: "systems/wfrp3e/assets/images/races/wood_elf.webp",
			creationPoints: 20,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 3,
				intelligence: 2,
				willpower: 3,
				fellowship: 2
			},
			name: "RACE.woodElf",
			origins: {
				athelLoren: {
					abilities: [
						"Compendium.wfrp3e.items.Item.0MdYpo3lvvLgPwvZ",
						"Compendium.wfrp3e.items.Item.MFNBzJvfpOsp2G3z",
						"Compendium.wfrp3e.items.Item.djj9tirxRkjnPrBp",
						"Compendium.wfrp3e.items.Item.VHiON3EQ7VMe41jT"
					],
					art: "systems/wfrp3e/assets/images/races/wood_elf.webp",
					corruption: 10,
					introduction: "ORIGIN.athelLoren.introduction",
					name: "ORIGIN.athelLoren.name",
					wound: 8
				}
			},
			startingCareerRollTableUuid: "Compendium.wfrp3e.roll-tables.DuENZYjzQuelc4Yl"
		}
	};

	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  originChoices = {};

		for(const race of Object.values(this.RACES))
			for(const [key, origin] of Object.entries(race.origins))
				originChoices[key] = origin.name;

		return {
			...super.defineSchema(),
			background: new fields.SchemaField({
				biography: new fields.HTMLField({nullable: true}),
				height: new fields.StringField({nullable: true}),
				weight: new fields.StringField({nullable: true}),
				build: new fields.StringField({nullable: true}),
				hairColour: new fields.StringField({nullable: true}),
				eyeColour: new fields.StringField({nullable: true}),
				birthplace: new fields.StringField({nullable: true}),
				familyMembers: new fields.StringField({nullable: true}),
				personalGoal: new fields.StringField({nullable: true}),
				allies: new fields.StringField({nullable: true}),
				enemies: new fields.StringField({nullable: true}),
				campaignNotes: new fields.HTMLField({nullable: true})
			}),
			corruption: new fields.SchemaField({
				max: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			experience: new fields.SchemaField({
				current: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				total: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			favour: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			fortune: new fields.SchemaField({
				max: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true})
			}),
			origin: new fields.StringField({
				choices: originChoices,
				initial: "reiklander",
				nullable: false,
				required: true
			}),
			party: new fields.DocumentUUIDField(),
			power: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
		};
	}

	/** @inheritDoc */
	static migrateData(source)
	{
		if(source.party && !source.party.startsWith("Actor."))
			source.party = `Actor.${source.party}`;

		return super.migrateData(source);
	}

	/**
	 * The character's current career.
	 * @returns {Item}
	 */
	get currentCareer()
	{
		return this.parent.itemTypes.career.find(career => career.system.current === true);
	}

	/**
	 * The character's party.
	 * @returns {Actor}
	 */
	get currentParty()
	{
		return fromUuidSync(this.party) ?? game.actors.contents.find(actor => actor.id === this.party);
	}

	/**
	 * The character's origin complete data.
	 * @returns {Object} The data from the character's origin.
	 */
	get originData()
	{
		return {
			id: this.origin,
			...this.race.origins[this.origin]
		};
	}

	/**
	 * Whether the character owns a Faith talent.
	 * @returns {boolean}
	 */
	get priest() {
		return this.parent.itemTypes.talent.find(talent => talent.system.type === "faith") != null;
	}

	/**
	 * The character's race depending on their origin.
	 * @returns {Object} The character's race.
	 */
	get race()
	{
		const [id, race] = Object.entries(this.constructor.RACES).find(([key, race]) => this.origin in race.origins);
		return {id, ...race};
	}

	/**
	 * The character's rank, which is the character's total experience divided by 10 + 1.
	 * @returns {number} The character's rank.
	 */
	get rank()
	{
		return Math.floor(this.experience.total / 10) + 1;
	}

	/**
	 * The sum of the encumbrance of every armour, trapping and weapon owned by the character.
	 * @returns {number} The total of the encumbrance.
	 */
	get totalEncumbrance()
	{
		let totalEncumbrance = 0;

		for(const item of this.parent.items)
			if(["armour", "trapping", "weapon"].includes(item.type))
				totalEncumbrance += item.system.encumbrance;

		return totalEncumbrance;
	}

	/**
	 * Whether the character owns an Order talent.
	 * @returns {boolean}
	 */
	get wizard() {
		return this.parent.itemTypes.talent.find(talent => talent.system.type === "order") != null;
	}

	/** @inheritDoc */
	prepareDerivedData()
	{
		this._calculateCurrentExperience();
	}

	/**
	 * Calculates the remaining experience points of the character, depending on the number of spent advances.
	 * @private
	 */
	_calculateCurrentExperience()
	{
		this.experience.current = this.experience.total;

		for(const career of this.parent.itemTypes.career)
			this.experience.current -= career.system.experienceSpent;
	}
}
