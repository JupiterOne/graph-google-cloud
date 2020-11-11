import { cac } from 'cac';
import Logger from 'bunyan';
import { ok as assert } from 'assert';
import { setupOrganization } from './organizationSetup';
import bunyanFormat from 'bunyan-format';

interface CliArguments {
  jupiteroneAccountId: string;
  jupiteroneApiKey: string;
  googleAccessToken: string;
  organizationId?: string[] | (string | number)[];
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

function convertToArrayOfStrings(
  data: string | string[] | (string | number)[],
): string[] {
  const projectIds = Array.isArray(data) ? data : [data];
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
    '--organization-id [organizationId]',
    '(Optional) Array of organization IDs to collect projects from',
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

    if (!options.organizationId && !options.projectId) {
      throw new Error(
        'One of the following CLI arguments is required: "--organization-id", "--project-id"',
      );
    }

    if (options.organizationId && options.projectId) {
      throw new Error(
        'Only one of the following CLI arguments can be provided: "--organization-id", "--project-id"',
      );
    }
  });

cli.help();
const parsed = cli.parse(process.argv, { run: true });

(async () => {
  const {
    jupiteroneAccountId,
    jupiteroneApiKey,
    googleAccessToken,
    organizationId,
    projectId,
    help,
  } = parsed.options as CliArguments;

  const projectIds = projectId && convertToArrayOfStrings(projectId);
  const organizationIds =
    organizationId && convertToArrayOfStrings(organizationId);
  const jupiteroneEnv = process.env.JUPITERONE_ENV;

  logger.debug(
    {
      jupiteroneAccountId,
      projectId,
      organizationIds,
      projectIds,
      jupiteroneApiKey: jupiteroneApiKey && redactCliSecret(jupiteroneApiKey),
      jupiteroneEnv,
      googleAccessToken:
        googleAccessToken && redactCliSecret(googleAccessToken),
    },
    'Running CLI with options...',
  );

  if (help) return;

  const setupOrganizationResult = await setupOrganization({
    jupiteroneAccountId,
    jupiteroneApiKey,
    googleAccessToken,
    logger,
    organizationIds,
    projectIds,
    jupiteroneEnv,
  });

  logger.info(
    setupOrganizationResult,
    'Finished setting up all JupiterOne Google Cloud integration instances',
  );
})().catch((err) => {
  logger.error({ err }, 'Error running organization setup CLI');
});
