import yaml from "yaml"
import * as fs from "fs"
import { AppConfig } from "./types"

const appConfig: AppConfig = yaml.parse(fs.readFileSync('config.yaml', 'utf-8'))

export function overrideConfig(): void {
  fs.writeFileSync('config.yaml', yaml.stringify(appConfig), 'utf-8');
}

export { appConfig }
