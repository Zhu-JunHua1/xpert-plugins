import { cp, mkdir, access } from 'node:fs/promises'
import { resolve } from 'node:path'
const source = resolve('src/xpert-support-triage-assistant.yaml')
const target = resolve('dist/xpert-support-triage-assistant.yaml')
if (process.argv.includes('--check')) { await access(target) } else { await mkdir(resolve('dist'), { recursive: true }); await cp(source, target) }
