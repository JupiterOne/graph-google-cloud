/* eslint-disable no-console */
import { promises as fs } from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { invocationConfig } from '../src';
import { GoogleCloudIntegrationStep } from '../src/types';
import chalk from 'chalk';

const table = require('markdown-table');

const documentPermissionsCommand = new Command();

interface DocumentCommandArgs {
  outputFile: string;
}

const J1_PERMISSIONS_DOCUMENTATION_MARKER_START =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_START} -->';
const J1_PERMISSIONS_DOCUMENTATION_MARKER_END =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_END} -->';
const J1_APIS_DOCUMENTATION_MARKER_START =
  '<!-- {J1_APIS_DOCUMENTATION_MARKER_START} -->';
const J1_APIS_DOCUMENTATION_MARKER_END =
  '<!-- {J1_APIS_DOCUMENTATION_MARKER_END} -->';
const J1_APIS_DOCUMENTATION_LINKS_MARKER_START =
  '<!-- {J1_APIS_DOCUMENTATION_LINKS_MARKER_START} -->';
const J1_APIS_DOCUMENTATION_LINKS_MARKER_END =
  '<!-- {J1_APIS_DOCUMENTATION_LINKS_MARKER_END} -->';

documentPermissionsCommand
  .command('documentPermissions')
  .description('Generate GCP permissions list')
  .option(
    '-o, --output-file <path>',
    'project relative path to generated Markdown file',
    path.join('docs', 'jupiterone.md'),
  )
  .action(executeDocumentPermissionsAction);

documentPermissionsCommand.parse();

async function executeDocumentPermissionsAction(options: DocumentCommandArgs) {
  const { outputFile } = options;

  console.log(
    chalk.gray(
      'DOCUMENT PERMISSIONS (START): Collecting permissions from steps...',
    ),
  );

  const documentationFilePath = path.join(process.cwd(), outputFile);
  const oldDocumentationFile = await getDocumentationFile(
    documentationFilePath,
  );

  if (!oldDocumentationFile) {
    return;
  }

  const { integrationSteps } = invocationConfig;

  const permissionsList = new Set<string>();
  const apisList = new Set<string>();

  integrationSteps.map((integrationStep) => {
    const googleCloudIntegrationStep =
      integrationStep as GoogleCloudIntegrationStep;
    if (googleCloudIntegrationStep.permissions) {
      googleCloudIntegrationStep.permissions.map((permission) =>
        permissionsList.add(permission),
      );
    }

    if (googleCloudIntegrationStep.apis) {
      googleCloudIntegrationStep.apis.map((api) => apisList.add(api));
    }
  });

  const { permissionsMarkdown, apisListMarkdown, apisLinksMarkdown } =
    getNewDocumentationVersions({ apisList, permissionsList });

  console.log(chalk.gray(permissionsMarkdown));
  console.log(chalk.gray(apisListMarkdown));
  console.log(chalk.gray(apisLinksMarkdown));

  let newDocumentationFile: string;

  if (permissionsMarkdown) {
    newDocumentationFile = replaceBetweenDocumentMarkers(
      oldDocumentationFile,
      permissionsMarkdown,
      J1_PERMISSIONS_DOCUMENTATION_MARKER_START,
      J1_PERMISSIONS_DOCUMENTATION_MARKER_END,
    );
  }

  if (apisListMarkdown) {
    newDocumentationFile = replaceBetweenDocumentMarkers(
      newDocumentationFile!,
      apisListMarkdown,
      J1_APIS_DOCUMENTATION_MARKER_START,
      J1_APIS_DOCUMENTATION_MARKER_END,
    );
  }

  if (apisLinksMarkdown) {
    newDocumentationFile = replaceBetweenDocumentMarkers(
      newDocumentationFile!,
      apisLinksMarkdown,
      J1_APIS_DOCUMENTATION_LINKS_MARKER_START,
      J1_APIS_DOCUMENTATION_LINKS_MARKER_END,
    );
  }

  try {
    await fs.writeFile(documentationFilePath, newDocumentationFile!, {
      encoding: 'utf-8',
    });
  } catch (error) {
    console.log(
      chalk.gray(
        `Unable to write documentation file from path ${documentationFilePath}.`,
      ),
    );
  }

  console.log(
    chalk.gray(
      `DOCUMENT PERMISSIONS (END): Finished document permissions process.`,
    ),
  );
}

function getDocumentationFile(documentationFilePath: string) {
  try {
    chalk.gray(`Reading documentation file from ${documentationFilePath}`);
    return fs.readFile(documentationFilePath, {
      encoding: 'utf-8',
    });
  } catch (error) {
    console.log(
      chalk.gray(
        `Unable to read documentation file from path ${documentationFilePath}. Aborting`,
      ),
    );
  }
}

function getNewDocumentationVersions({
  permissionsList,
  apisList,
}: {
  permissionsList: Set<string>;
  apisList: Set<string>;
}): {
  permissionsMarkdown: string | undefined;
  apisListMarkdown: string | undefined;
  apisLinksMarkdown: string | undefined;
} {
  const tableMarkdown = getPermissionsTableMarkdown(
    Array.from(permissionsList).sort((a, b) => a.localeCompare(b)) as string[],
  );
  const apisMarkdown = getApisListMarkdown(
    Array.from(apisList).sort((a, b) => a.localeCompare(b)) as string[],
  );
  const apisLinksMarkdown = getApisListTableMarkdown(
    Array.from(apisList).sort((a, b) => a.localeCompare(b)) as string[],
  );

  const codeBlockMarkdown = '```';

  return {
    permissionsMarkdown: `${J1_PERMISSIONS_DOCUMENTATION_MARKER_START}\n\n${tableMarkdown}\n${J1_PERMISSIONS_DOCUMENTATION_MARKER_END}`,
    apisListMarkdown: `${J1_APIS_DOCUMENTATION_MARKER_START}
    \n${codeBlockMarkdown}${apisMarkdown}${codeBlockMarkdown}\n${J1_APIS_DOCUMENTATION_MARKER_END}`,
    apisLinksMarkdown: `${J1_APIS_DOCUMENTATION_LINKS_MARKER_START}\n\n${apisLinksMarkdown}\n${J1_APIS_DOCUMENTATION_LINKS_MARKER_END}`,
  };
}

function getPermissionsTableMarkdown(permissionsList: string[]): string {
  return table([
    [`Permissions List (${permissionsList.length})`],
    ...permissionsList.map((permission) => [`\`${permission}\``]),
  ]);
}

function getApisListMarkdown(apisList: string[]): string {
  const backSlashChar = '\\';

  return `
gcloud services enable ${backSlashChar}\n${apisList
    .map((api) => ` ${api}`)
    .join(` ${backSlashChar}\n`)}
  `;
}

function getApisListTableMarkdown(apisList: string[]): string {
  return table([
    ['Service Name', 'Service API'],
    ...apisList.map((api) => [
      `[${
        api.split('.')[0]
      }](https://console.developers.google.com/apis/library/${api})`,
      api,
    ]),
  ]);
}

function replaceBetweenDocumentMarkers(
  oldDocumentationFile: string,
  newGeneratedDocumentationSection: string,
  startMarker: string,
  endMarker: string,
): string {
  const startIndex = oldDocumentationFile.indexOf(startMarker);

  if (startIndex === -1) {
    return `${oldDocumentationFile}\n\n${newGeneratedDocumentationSection}`;
  }

  const endIndex = oldDocumentationFile.indexOf(endMarker);

  return (
    oldDocumentationFile.substring(0, startIndex) +
    newGeneratedDocumentationSection +
    oldDocumentationFile.substring(endIndex + endMarker.length)
  );
}
