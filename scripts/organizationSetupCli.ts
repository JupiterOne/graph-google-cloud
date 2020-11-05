import { cac } from 'cac';
import Logger from 'bunyan';
import { ok as assert } from 'assert';
import { setupOrganization } from './organizationSetup';
import bunyanFormat from 'bunyan-format';

interface CliArguments {
  jupiteroneAccountId: string;
  jupiteroneApiKey: string;
  googleAccessToken: string;
  projectId?: string[] | (string | number)[];
  help?: boolean;
}

const logger = Logger.createLogger({
  name: 'jupiterone-organization-setup',
  level: process.env.DEBUG ? 'debug' : 'info',
  serializers: {
    err: Logger.stdSerializers.err,
  },
  streams: [{ stream: bunyanFormat({ outputMode: 'short' }) }],
});

function assertRequiredCliArg(argName: string, val: string) {
  assert(val, `Missing required CLI argument: ${argName}`);
}

function redactCliSecret(secret: string) {
  return `${secret.substr(0, 5)}...`;
}

function projectIdArgToProjectIds(
  projectId: string | string[] | (string | number)[],
): string[] | undefined {
  const projectIds = Array.isArray(projectId) ? projectId : [projectId];
  return Array.from(new Set(projectIds.map((p) => p.toString())));
}

const cli = cac('JupiterOne Google Cloud Organization Integration Setup');

cli
  .command('[]', 'Default command: Run the organization setup')
  .option(
    '--jupiterone-account-id <jupiteroneAccountId>',
    '(Required) JupiterOne Account ID',
  )
  .option(
    '--jupiterone-api-key <jupiteroneApiKey>',
    '(Required) JupiterOne API Key',
  )
  .option(
    '--google-access-token <googleAccessToken>',
    '(Required) JupiterOne API Key',
  )
  .option(
    '--project-id [projectId]',
    '(Optional) Array of project IDs to create integration instances with',
  )
  .action((options: CliArguments) => {
    assertRequiredCliArg(
      '--jupiterone-account-id',
      options.jupiteroneAccountId,
    );
    assertRequiredCliArg('--jupiterone-api-key', options.jupiteroneApiKey);
    assertRequiredCliArg('--google-access-token', options.googleAccessToken);
  });

cli.help();
const parsed = cli.parse(process.argv, { run: true });

(async () => {
  const {
    jupiteroneAccountId,
    jupiteroneApiKey,
    googleAccessToken,
    projectId,
    help,
  } = parsed.options as CliArguments;

  const projectIds = projectId && projectIdArgToProjectIds(projectId);

  logger.debug(
    {
      jupiteroneAccountId,
      projectId,
      projectIds,
      jupiteroneApiKey: jupiteroneApiKey && redactCliSecret(jupiteroneApiKey),
      googleAccessToken:
        googleAccessToken && redactCliSecret(googleAccessToken),
    },
    'Running CLI with options...',
  );

  if (help) return;

  await setupOrganization({
    jupiteroneAccountId,
    jupiteroneApiKey,
    googleAccessToken,
    logger,
    projectIds,
  });
})().catch((err) => {
  logger.error({ err }, 'Error running organization setup CLI');
});
