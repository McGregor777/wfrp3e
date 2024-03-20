/** @inheritDoc */
export default class CharacteristicUpgrader extends FormApplication
{
	/**
	 * @param {WFRP3eActor} object
	 * @param {WFRP3eItem} career
	 * @param {boolean} [nonCareer]
	 */
	constructor(object, career, nonCareer = false)
	{
		super(object);

		this.career = career;
		this.nonCareer = nonCareer;
	}

	/** @inheritDoc */
	get title()
	{
		return game.i18n.localize("CHARACTERISTICUPGRADER.Title");
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "selector", "characteristic-upgrader"],
			template: "systems/wfrp3e/templates/applications/characteristic-upgrader.hbs",
			width: 360
		};
	}

	/** @inheritDoc */
	async getData()
	{
		const data = {
			...super.getData(),
			availableOpenAdvancesAmount: this.career.system.advances.open.filter(advance => !advance).length,
			availableNonCareerAdvancesAmount: this.career.system.advances.nonCareer.filter(advance => !advance.type).length,
			career: this.career,
			characteristics: Object.entries(this.object.system.characteristics).reduce((characteristics, characteristic) => {
				if(!this.nonCareer) {
					if(this.career.system.primaryCharacteristics.includes(characteristic[0]))
						characteristics[characteristic[0]] = {
							...characteristic[1],
							...CONFIG.WFRP3e.characteristics[characteristic[0]]
						};
				}
				else {
					if(!this.career.system.primaryCharacteristics.includes(characteristic[0]))
						characteristics[characteristic[0]] = {
							...characteristic[1],
							...CONFIG.WFRP3e.characteristics[characteristic[0]]
						};
				}

				return characteristics;
			}, {}),
			nonCareer: this.nonCareer
		};

		console.log(data);

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find("input").change(this._onCharacteristicValueChange.bind(this, html));
	}

	/** @inheritDoc */
	async _updateObject(event, formData)
	{
		if(!formData.upgrade)
			ui.notifications.warn(game.i18n.localize("CHARACTERISTICUPGRADER.NoUpgradeSelectedWarning"));

		const matches = [...formData.upgrade.matchAll(new RegExp(/(^\w*)_(\w*$)/, "g"))][0];
		const advancementName = game.i18n.format(
			`CHARACTERISTICUPGRADER.Characteristic${matches[2][0].toUpperCase() + matches[2].slice(1, matches[2].length)}`, {
			characteristic: game.i18n.localize(CONFIG.WFRP3e.characteristics[matches[1]].name)
		});
		const actorUpdates = {};
		actorUpdates[`system.characteristics.${matches[1] + "." + matches[2]}`] = this.object.system.characteristics[matches[1]][matches[2]] + 1;

		this.object.update(actorUpdates);

		if(!this.nonCareer) {
			const careerUpdates = {"system.advances.open": this.career.system.advances.open};

			if(matches[2] === "rating") {
				let advanceCount = 0;

				careerUpdates["system.advances.open"].forEach((openAdvance, index) => {
					if(advanceCount <= this.object.system.characteristics[matches[1]].rating && !openAdvance) {
						careerUpdates["system.advances.open"][index] = advancementName;
						advanceCount++
					}
				});
			}
			else if(matches[2] === "fortune")
				careerUpdates["system.advances.open"][careerUpdates["system.advances.open"].findIndex(advance => !advance)] = advancementName;

			this.career.update(careerUpdates);
		}
		else {
			const careerUpdates = {"system.advances.nonCareer": this.career.system.advances.nonCareer};
			careerUpdates["system.advances.nonCareer"][careerUpdates["system.advances.nonCareer"].findIndex(advance => !advance.type)] = {
				cost: this.object.system.characteristics[matches[1]].rating + 2,
				type: advancementName
			};

			this.career.update(careerUpdates);
		}
	}

	async _onCharacteristicValueChange(html, event)
	{
		const labelParent = $(event.currentTarget).parents("label");
		const matches = [...event.currentTarget.value.matchAll(new RegExp(/(^\w*)_(\w*$)/, "g"))][0];

		html.find("label.active").removeClass("active");
		Object.keys(CONFIG.WFRP3e.characteristics).forEach(characteristic => {
			if(characteristic !== "varies") {
				html.find(".characteristic." + characteristic + " .result .rating").text(this.object.system.characteristics[characteristic].rating);
				html.find(".characteristic." + characteristic + " .result .fortune").text(this.object.system.characteristics[characteristic].fortune);
			}
		});

		labelParent.addClass("active");
		labelParent.parent().siblings(".result").find("." + matches[2]).text(this.object.system.characteristics[matches[1]][matches[2]] + 1);

		html.find(".selection").text(
			game.i18n.format(
				`CHARACTERISTICUPGRADER.Characteristic${matches[2][0].toUpperCase() + matches[2].slice(1, matches[2].length)}`, {
					characteristic: game.i18n.localize(CONFIG.WFRP3e.characteristics[matches[1]].name)
				})
		);
	}
}