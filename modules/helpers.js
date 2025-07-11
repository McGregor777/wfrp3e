/**
 * Replaces the first letter of a string with its capital.
 * @param {String} string The string to capitalize.
 * @returns {String}
 */
export function capitalize(string)
{
	return string[0].toUpperCase() + string.slice(1);
}