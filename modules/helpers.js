/**
 * Replaces the first letter of a string with its capital.
 * @param {String} string The string to capitalize.
 * @returns {String}
 */
export function capitalize(string)
{
	return string[0].toUpperCase() + string.slice(1);
}

/**
 * Sorts an array of Talents by their type.
 * @param {Array[WFRP3eItem]} talents An array of Talents.
 * @returns {Object} An array of Talents sorted by their type.
 */
export function sortTalentsByType(talents)
{
	return Object.keys(CONFIG.WFRP3e.talentTypes).reduce((sortedTalents, talentType) => {
		sortedTalents[talentType] = talents.filter(talent => talent.system.type === talentType);
		return sortedTalents;
	}, {});
}