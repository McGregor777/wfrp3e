import autoprefixer from "autoprefixer";
import {spawn} from "child_process";
import logger from "fancy-log";
import {compilePack, extractPack} from "@foundryvtt/foundryvtt-cli";
import Config from "@foundryvtt/foundryvtt-cli/config.mjs";
import fs from "fs";
import less from "less";
import path from "path";
import postcss from "postcss";
import yaml from "js-yaml";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";

/**
 * WFRP3e Development CLI
 *
 * This Node.js script provides developer utilities for the WFRP3e system:
 * - Styles: `css`, `watch`
 * - Compendia: `compile`, `extract`
 * - Dev‑only helpers: `init`, `launch`
 * - Convenience: `build`
 *
 * Dev‑only commands
 * - `launch` and `init` are intended for local development. They are blocked when
 *   `NODE_ENV=production` or `CI=true` unless explicitly overridden by `ALLOW_DEV_COMMANDS=1`.
 *
 * Usage
 * - Via Node.js: `node cli.mjs <command> [options]`
 * - Via npm scripts: `npm run <script> -- [options]`
 */

const PACK_SOURCE = "packs/source/";

/**
 * Throw or exit when a dev‑only command is invoked in production/CI.
 * Allows override via `ALLOW_DEV_COMMANDS=1`.
 */
function enforceDevOnly(commandName)
{
	const {NODE_ENV, CI, ALLOW_DEV_COMMANDS} = process.env;
	const isBlocked = (NODE_ENV === "production" || CI === "true") && ALLOW_DEV_COMMANDS !== "1";
	if(isBlocked) {
		console.error(`${commandName} is a development‑only command. It is blocked because NODE_ENV=production or CI=true. Set ALLOW_DEV_COMMANDS=1 to override.`);
		process.exitCode = 1;
		return false;
	}

	return true;
}

/**
 * Compile LESS into CSS.
 * @returns {Promise<void>}
 * @example
 * // One‑shot compile
 * node cli.mjs css
 * // or via npm
 * npm run css
 */
async function compileLess()
{
	const src = "./styles/less/wfrp3e.less";
	const dest = "./styles/wfrp3e.css";

	logger.info("Compiling LESS…");

	try {
		const lessContent = await fs.promises.readFile(src, "utf8");

		// 1. Compile LESS
		const renderResult = await less.render(lessContent, {
			filename: path.resolve(src)
		});

		// 2. Autoprefixer via PostCSS
		const processed = await postcss([autoprefixer({ cascade: false })])
			.process(renderResult.css, { from: src, to: dest });

		// 3. Write output
		await fs.promises.writeFile(dest, processed.css);
		logger.info("LESS compilation finished.");
	} catch (err) {
		logger.error("Error compiling LESS:", err);
	}
}

/**
 * Watch LESS files and recompile on changes.
 * Long‑running process; stop it from your IDE or terminal.
 * Development‑only; blocked in production/CI unless `ALLOW_DEV_COMMANDS=1`.
 * @example
 * node cli.mjs watch
 * // or
 * npm run watch
 */
function watchUpdates()
{
	if(!enforceDevOnly("watch"))
		return;

	logger.info("Watching for LESS changes…");
	// fs.watch with recursive is widely supported on Windows/macOS for folders
	let fsWait = false;
	fs.watch("./styles/less", { recursive: true }, (eventType, filename) => {
		if (filename && filename.endsWith(".less")) {
			if (fsWait) return;
			fsWait = setTimeout(() => {
				fsWait = false;
			}, 100); // Debounce simple

			logger.info(`File ${filename} changed.`);
			compileLess();
		}
	});
}

/**
 * Compile source JSON files into LevelDB compendium packs.
 * @param {object} argv
 * @param {string} [argv.pack] Name of a single pack to compile (optional).
 * @returns {Promise<void>}
 * @example
 * // All packs
 * node cli.mjs compile
 * // Single pack
 * node cli.mjs compile --pack items
 */
async function compilePacks(argv)
{
	const packName = argv.pack;
	const system = JSON.parse(fs.readFileSync("./system.json", { encoding: "utf8" }));
	let packs = system.packs;

	if (packName && packName.length !== 0)
		packs = packs.filter(pack => pack.name === packName);

	for (const packInfo of packs) {
		logger.info(`Compiling pack ${packInfo.name}`);
		await compilePack(PACK_SOURCE + packInfo.name, packInfo.path);
	}
}

/**
 * Extract LevelDB compendium packs to JSON files.
 * Development‑only; blocked in production/CI unless `ALLOW_DEV_COMMANDS=1`.
 * @param {object} argv
 * @param {string} [argv.pack] Name of a single pack to extract (optional).
 * @returns {Promise<void>}
 * @example
 * // All packs
 * node cli.mjs extract
 * // Single pack
 * node cli.mjs extract --pack items
 */
async function extractPacks(argv)
{
	if(!enforceDevOnly("extract"))
		return;

	const packName = argv.pack;
	const system = JSON.parse(fs.readFileSync("./system.json", { encoding: "utf8" }));
	let packs = system.packs;

	if (packName && packName.length !== 0)
		packs = packs.filter(pack => pack.name === packName);

	for (const packInfo of packs) {
		logger.info(`Extracting pack ${packInfo.name}`);
		await extractPack(packInfo.path, PACK_SOURCE + packInfo.name);
	}
}

/**
 * Initialize local symlinks to Foundry sources in a `foundry/` folder.
 * Development‑only; blocked in production/CI unless `ALLOW_DEV_COMMANDS=1`.
 * Reads `foundry-config.yaml` with at least `installPath`.
 * @returns {Promise<void>}
 * @example
 * node cli.mjs init
 */
async function initialize()
{
	if(!enforceDevOnly("init"))
		return;

	if(fs.existsSync("foundry-config.yaml")) {
		let fileRoot = "";
		try {
			const configFile = await fs.promises.readFile("foundry-config.yaml", "utf-8"),
				  foundryConfig = yaml.load(configFile),
				  nested = fs.existsSync(path.join(foundryConfig.installPath, "resources", "app"));

			fileRoot = nested
				? path.join(foundryConfig.installPath, "resources", "app")
				: foundryConfig.installPath;
		}
		catch(error) {
			console.error(`Error reading foundry-config.yaml: ${error}`);
			return;
		}

		await fs.promises.mkdir("foundry", {recursive: true});

		for(const p of ["client", "common", "tsconfig.json"]) {
			try {
				await fs.promises.symlink(path.join(fileRoot, p), path.join("foundry", p));
			}
			catch(error) {
				if(error.code !== "EEXIST")
					throw error;
			}
		}

		try {
			await fs.promises.symlink(path.join(fileRoot, "public", "lang"), path.join("foundry", "lang"));
		}
		catch(error) {
			if(error.code !== "EEXIST")
				throw error;
		}

		logger.info("Initialization complete.");
	}
}

/**
 * Launch Foundry VTT (long‑running).
 * Development‑only; blocked in production/CI unless `ALLOW_DEV_COMMANDS=1`.
 * @param {object} argv
 * @param {string} [argv.world] World id to open (e.g., `warhammer-3e`).
 * @param {string} [argv.adminKey] Admin key to secure the Setup screen.
 * @param {boolean} [argv.demo=false] Launch in demo mode.
 * @param {number} [argv.port=30000] Port to listen on.
 * @param {boolean} [argv.noupnp=false] Disable UPnP port forwarding.
 * @param {boolean} [argv.noupdate=false] Disable automatic update checking.
 * @example
 * node cli.mjs launch --world=warhammer-3e --port=30000 --noupnp --noupdate
 */
function launchFoundryVTT(argv)
{
	if(!enforceDevOnly("launch"))
		return;

	const {demo, port, world, noupnp, noupdate, adminKey} = argv;

	const installPath = Config.instance.get("installPath");
	if(!installPath) {
		console.error("The installation path is not set.");
		process.exitCode = 1;
		return;
	}

	const dataPath = Config.instance.get("dataPath");
	if(!dataPath) {
		console.error("The data path is not set.");
		process.exitCode = 1;
		return;
	}

	const electronPath = path.normalize(path.join(installPath, "resources", "app", "main.js")),
		  nodePath = path.normalize(path.join(installPath, "main.js")),
		  fvttPath = fs.existsSync(electronPath) ? electronPath : nodePath;

	if(!fs.existsSync(fvttPath)) {
		console.error("Unable to find a valid launch path.");
		process.exitCode = 1;
		return;
	}

	const foundry = spawn("node", [
		fvttPath,
		`--dataPath=${dataPath}`,
		`--port=${port}`,
		demo ? "--demo" : "",
		world ? `--world=${world}` : "",
		noupnp ? "--noupnp" : "",
		noupdate ? "--noupdate" : "",
		adminKey ? `--adminKey=${adminKey}` : ""
	].filter(arg => arg !== ""));

	foundry.stdout.on("data", data => console.log(data.toString()));
	foundry.stderr.on("data", data => console.error(data.toString()));
	foundry.on("close", code => console.log(`Foundry VTT exited with code ${code}`));
}

// Configuration Yargs
yargs(hideBin(process.argv))
	.command("css", "Compile LESS to CSS", {}, compileLess)
	.command("watch", "Watch LESS files and recompile (dev‑only, long‑running)", {}, async () => {
		await compileLess();
		watchUpdates();
	})
	.command("compile [pack]", "Compile JSON to LevelDB", (yargs) => {
		yargs.positional("pack", { describe: "Name of the pack", type: "string" });
	}, compilePacks)
	.command("extract [pack]", "Extract LevelDB to JSON (dev‑only)", (yargs) => {
		yargs.positional("pack", { describe: "Name of the pack", type: "string" });
	}, extractPacks)
	.command("init", "Initialize configuration symlinks (dev‑only)", {}, initialize)
	.command("launch", "Launch Foundry VTT (dev‑only, long‑running)", (yargs) => {
		yargs.option("demo", {type: "boolean", default: false})
			.option("port", {type: "number", default: 30000})
			.option("world", {type: "string", describe: "World id (e.g. warhammer-3e)"})
			.option("noupnp", {type: "boolean", default: false})
			.option("noupdate", {type: "boolean", default: false})
			.option("adminKey", {type: "string"});
	}, launchFoundryVTT)
	.command("build", "Build CSS and Packs (safe for CI)", {}, async (argv) => {
		await compileLess();
		await compilePacks(argv);
	})
	.demandCommand(1)
	.help()
	.parse();
