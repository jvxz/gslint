import type { Args } from './lib/types/args'
import * as p from '@clack/prompts'
import { FetchHttpClient } from '@effect/platform'
import c from 'ansis'
import { cac } from 'cac'
import { Cause, Effect, Exit } from 'effect'
import { name, version } from '../package.json'
import { run } from './run'

function header() {
  p.intro(`${c.bold.white`${name} `}${c.dim`${version}`}`)
}

const cli = cac(name)

cli
  .command('', 'Run the wizard')

  .option('-y, --yes', 'Skip Node.js project and commit warnings (add --package-manager to restore dependency installation)')
  .option('-f, --force', 'Bypass validation checks')
  .option('-p, --package-manager <name>', 'Manually specify package manager')
  .option('-g, --gist <link>', 'Provide Gist to use for the config')
  .action(async (args: Args) => {
    header()

    const exit = await run(args)
      .pipe(Effect.provide(FetchHttpClient.layer))
      .pipe(Effect.runPromiseExit)

    if (Exit.isFailure(exit)) {
      p.log.error(c.inverse.red(' An error occurred... '))
      p.log.error(c.red`${Cause.pretty(exit.cause)}`)
      process.exit(1)
    }

    p.outro('Done! 🎉')
  })

cli.help()
cli.version(version)
cli.parse()
