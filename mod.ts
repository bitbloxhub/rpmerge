import {walk} from "https://deno.land/std@0.164.0/fs/walk.ts";
import {relative} from "https://deno.land/std@0.164.0/path/posix.ts";

export function mergeLangs(langorigin: string, langnew: string): string {
	const langoriginp = JSON.parse(langorigin) as Record<string, unknown>
	const langnewp =  JSON.parse(langnew) as Record<string, unknown>
	return JSON.stringify({...langoriginp , ...langnewp})
}

export function mergeModels(modelorigin: string, modelnew: string): string {
	const modeloriginp = JSON.parse(modelorigin) as Record<string, unknown>
	const modelnewp =  JSON.parse(modelnew) as Record<string, unknown>
	return JSON.stringify({
		...modelnewp,
		overrides: [
			// deno-lint-ignore no-explicit-any
			...modeloriginp["overrides"] as Array<any>,
			// deno-lint-ignore no-explicit-any
			...modelnewp["overrides"] as Array<any>
		] 
	})
}

export function mergeSounds(soundsorigin: string, soundsnew: string): string {
	const soundsoriginp = JSON.parse(soundsorigin) as Record<string, unknown>
	const soundsnewp =  JSON.parse(soundsnew) as Record<string, unknown>
	return JSON.stringify({
		...soundsoriginp,
		...soundsnewp
	})
}

export default function merge(inputs: Array<string>, output: string) {
	inputs.forEach(async (dir) => {
		for await (const file of walk(dir)) {
			if (file.isFile) {
				const patha = file.path.split("/")
				if (patha[patha.length-2] == "lang") {
					try {
						await Deno.writeTextFile(`${output}/assets/${patha[patha.length - 3]}/lang/${patha[patha.length - 1]}`,
					 	 mergeLangs(await Deno.readTextFile(`${output}/assets/${patha[patha.length - 3]}/lang/${patha[patha.length - 1]}`),
					 	  await Deno.readTextFile(file.path)))
					} catch (_error) {
						await Deno.writeTextFile(
							`${output}/assets/${patha[patha.length - 3]}/lang/${patha[patha.length - 1]}`,
							await Deno.readTextFile(file.path))
					}
				} else if (patha[patha.length-2] == "item" && patha[patha.length-3] == "models") {
					try {
						await Deno.writeTextFile(`${output}/assets/${patha[patha.length - 4]}/models/item/${patha[patha.length - 1]}`,
					 	 mergeModels(await Deno.readTextFile(`${output}/assets/${patha[patha.length - 4]}/models/item/${patha[patha.length - 1]}`),
					 	  await Deno.readTextFile(file.path)))
					} catch (_error) {
						await Deno.writeTextFile(
							`${output}/assets/${patha[patha.length - 4]}/models/item/${patha[patha.length - 1]}`,
							await Deno.readTextFile(file.path))
					}
				} else if (patha[patha.length-1] == "sounds.json") {
					try {
						await Deno.writeTextFile(`${output}/assets/${patha[patha.length - 2]}/${patha[patha.length - 1]}`,
					 	 mergeSounds(await Deno.readTextFile(`${output}/assets/${patha[patha.length - 2]}/${patha[patha.length - 1]}`),
					 	  await Deno.readTextFile(file.path)))
					} catch (_error) {
						await Deno.writeTextFile(
							`${output}/assets/${patha[patha.length - 2]}/${patha[patha.length - 1]}`,
							await Deno.readTextFile(file.path))
					}
				} else {
					await Deno.writeTextFile(
						`${output}/${relative(dir, file.path)}`,
						await Deno.readTextFile(file.path))
				}
			} else if (file.isDirectory) {
				try {
					await Deno.mkdir(`${output}/${relative(dir, file.path)}`)
				} catch (_error) {
					// ignore
				}
			}
		}
	})
}