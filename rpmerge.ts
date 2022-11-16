import merge from "./mod.ts"

const output = Deno.args[0]
const inputs = Deno.args.slice(1)
merge(inputs, output)