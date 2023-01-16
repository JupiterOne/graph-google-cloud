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

  const newGeneratedDocumentationSection = getNewDocumentationVersion();

  console.log(chalk.gray(newGeneratedDocumentationSection));

  if (!newGeneratedDocumentationSection) return;

  const newDocumentationFile = replaceBetweenDocumentMarkers(
    oldDocumentationFile,
    newGeneratedDocumentationSection,
  );

  try {
    await fs.writeFile(documentationFilePath, newDocumentationFile, {
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

function getNewDocumentationVersion(): string | undefined {
  const { integrationSteps } = invocationConfig;

  const permissionsList = new Set<string>();

  integrationSteps.map((integrationStep) => {
    const googleCloudIntegrationStep =
      integrationStep as GoogleCloudIntegrationStep;
    if (googleCloudIntegrationStep.permissions)
      googleCloudIntegrationStep.permissions.map((permission) =>
        permissionsList.add(permission),
      );
  });

  const tableMarkdown = getTableMarkdown(
    Array.from(permissionsList).sort((a, b) => a.localeCompare(b)) as string[],
  );

  return `${J1_PERMISSIONS_DOCUMENTATION_MARKER_START}\n${tableMarkdown}\n${J1_PERMISSIONS_DOCUMENTATION_MARKER_END}`;
}

function getTableMarkdown(permissionsList: string[]): string {
  return table([
    [`Permissions List (${permissionsList.length})`],
    ...permissionsList.map((permission) => [`\`${permission}\``]),
  ]);
}

function replaceBetweenDocumentMarkers(
  oldDocumentationFile: string,
  newGeneratedDocumentationSection: string,
): string {
  const startIndex = oldDocumentationFile.indexOf(
    J1_PERMISSIONS_DOCUMENTATION_MARKER_START,
  );

  if (startIndex === -1) {
    return `${oldDocumentationFile}\n\n${newGeneratedDocumentationSection}`;
  }

  const endIndex = oldDocumentationFile.indexOf(
    J1_PERMISSIONS_DOCUMENTATION_MARKER_END,
  );

  return (
    oldDocumentationFile.substring(0, startIndex) +
    newGeneratedDocumentationSection +
    oldDocumentationFile.substring(
      endIndex + J1_PERMISSIONS_DOCUMENTATION_MARKER_END.length,
    )
  );
}
