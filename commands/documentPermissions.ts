import { promises as fs } from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { invocationConfig } from '../src';
import { GoogleCloudIntegrationStep } from '../src/types';

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
  const documentationFilePath = path.join(process.cwd(), outputFile);
  const oldDocumentationFile = await getDocumentationFile(
    documentationFilePath,
  );

  const newGeneratedDocumentationSection = getNewDocumentationVersion();

  if (!newGeneratedDocumentationSection) return;

  const newDocumentationFile = replaceBetweenDocumentMarkers(
    oldDocumentationFile,
    newGeneratedDocumentationSection,
  );

  await fs.writeFile(documentationFilePath, newDocumentationFile, {
    encoding: 'utf-8',
  });
}

function getDocumentationFile(documentationFilePath: string): Promise<string> {
  return fs.readFile(documentationFilePath, {
    encoding: 'utf-8',
  });
}

function getNewDocumentationVersion(): string | undefined {
  const { integrationSteps } = invocationConfig;

  const permissionsList = integrationSteps.reduce(
    (accumulatedPermissions, step) => {
      const googleCloudIntegrationStep = step as GoogleCloudIntegrationStep;
      return googleCloudIntegrationStep.permissions
        ? [...accumulatedPermissions, ...googleCloudIntegrationStep.permissions]
        : accumulatedPermissions;
    },
    [] as string[],
  );

  const tableMarkdown = getTableMarkdown(permissionsList);

  return `${J1_PERMISSIONS_DOCUMENTATION_MARKER_START}\n${tableMarkdown}\n${J1_PERMISSIONS_DOCUMENTATION_MARKER_END}`;
}

function getTableMarkdown(permissionsList: string[]): string {
  return table([
    ['Permissions List'],
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
