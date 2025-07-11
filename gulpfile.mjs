import fs from "fs";
import gulp from "gulp";
import logger from "fancy-log";
import path from "path";
import prefix from "gulp-autoprefixer";
import less from "gulp-less";
import yargs from "yargs";
import {compilePack, extractPack} from "@foundryvtt/foundryvtt-cli";

/**
 * Folder where the compiled compendium packs should be located relative to the system folder.
 * @type {string}
 */
const PACK_DESTINATION = "packs/";

/**
 * Folder where source JSON files should be located relative to the system folder.
 * @type {string}
 */
const PACK_SOURCE = "packs/source/";

/**
 * Compiles Less files into CSS files.
 * @returns {any}
 */
function compileLess()
{
	return gulp.src("./styles/less/wfrp3e.less")
		.pipe(less())
		.pipe(prefix({cascade: false}))
		.pipe(gulp.dest("./styles"));
}

/**
 * Watches for any update in Less files and recompiles them into CSS files if updates happened.
 */
function watchUpdates()
{
	gulp.watch("./styles/less/**/*.less", compileLess);
}

/**
 * Compile the source JSON files into compendium packs.
 * - `gulp compile` - Compile all JSON files into their LevelDB files.
 * @param {String} [packName] The name of the pack to compile.
 * @returns {Promise<void>}
 */
async function compilePacks(packName = null)
{
	const system = JSON.parse(fs.readFileSync("./system.json", {encoding: "utf8"})),
		  packs = system.packs;

	if(packName !== null && packName.length !== 0)
		packs.filter(pack => pack.name === packName);

	for(const packInfo of packs) {
		logger.info(`Compiling pack ${packInfo.name}`);
		await compilePack(PACK_SOURCE + packInfo.name, packInfo.path);
	}
}

/**
 * Extract the contents of compendium packs to JSON files.
 * - `gulp extract` - Extract all compendium NEDB files into JSON files.
 * @param {String} [packName] The name of the pack to extract.
 */
async function extractPacks(packName)
{
	const system = JSON.parse(fs.readFileSync("./system.json", {encoding: "utf8"})),
		  packs = system.packs;

	if(packName !== null && packName.length !== 0)
		packs.filter(pack => pack.name === packName);

	for(const packInfo of packs) {
		logger.info(`Extracting pack ${packInfo.name}`);
		await extractPack(packInfo.path, PACK_SOURCE + packInfo.name);
	}
}

export default gulp.series(gulp.parallel(compileLess), watchUpdates);
export const build = gulp.parallel(compileLess, /*javascript.compile, */compilePacks);
export const css = gulp.series(compileLess);
export const compile = gulp.series(compilePacks);
export const extract = gulp.series(extractPacks);
export const watch = gulp.series(gulp.parallel(compileLess), watchUpdates);