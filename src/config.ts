import yaml from "yaml"
import * as fs from "fs"
import {AppConfig} from "./types"

const appConfig: AppConfig = yaml.parse(fs.readFileSync('config.yaml', 'utf-8'))
export {appConfig}
