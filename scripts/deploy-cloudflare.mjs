import { spawnSync } from 'node:child_process'

const DEFAULT_PROJECT_NAME = 'letterlink'

const cliArgs = process.argv.slice(2)
const userProjectArgIndex = cliArgs.findIndex((value) => value === '--project-name')
const userProjectName =
  userProjectArgIndex >= 0 ? cliArgs[userProjectArgIndex + 1] : undefined
const projectName =
  userProjectName || process.env.CLOUDFLARE_PROJECT_NAME || DEFAULT_PROJECT_NAME

const runCommand = (command, args, extraEnv = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

runCommand('npm', ['run', 'build'])

const deployArgs = ['pages', 'deploy', 'dist', '--project-name', projectName, '--commit-dirty=true']

if (!cliArgs.includes('--branch') && process.env.CLOUDFLARE_BRANCH) {
  deployArgs.push('--branch', process.env.CLOUDFLARE_BRANCH)
}

const wranglerBin = new URL('../node_modules/.bin/wrangler', import.meta.url).pathname
runCommand(wranglerBin, [...deployArgs, ...cliArgs])
