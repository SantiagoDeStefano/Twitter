import argv from 'minimist'
import { config } from 'dotenv'
config()

const options = argv(process.argv.slice(2))

export const isProduction = Boolean(options.production)
