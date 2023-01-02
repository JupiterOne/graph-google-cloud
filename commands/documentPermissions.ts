import { promises as fs } from 'fs';
import * as path from 'path';
import { Command } from 'commander';
const table = require('markdown-table');

type ServicePermissionsDescription = { service: string; permssions: string[] };

const documentPermissionsCommand = new Command();

const J1_PERMISSIONS_DOCUMENTATION_MARKER_START =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_START} -->';
const J1_PERMISSIONS_DOCUMENTATION_MARKER_END =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_END} -->';

documentPermissionsCommand
  .command('documentPermissions')
  .description('Generate GCP permissions list')
  .action(executeDocumentPermissionsAction);

documentPermissionsCommand.parse();

async function executeDocumentPermissionsAction() {
  const documentationFilePath = path.join(process.cwd(), '/docs/jupiterone.md');
  const oldDocumentationFile = await getDocumentationFile(
    documentationFilePath,
  );

  const newGeneratedDocumentationSection = await getNewDocumentationVersion();

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

async function getNewDocumentationVersion(): Promise<string> {
  const stepsFolderPath = path.join(process.cwd(), '/src/steps');
  const stepFolderNames = await fs.readdir(stepsFolderPath);
  const stepIndexFileName = 'index.ts';
  const pathNamesToSkip = ['.ts', '__test__', 'orgpolicy'];
  const pathNamesToSkipReg = new RegExp(pathNamesToSkip.join('|'));

  let permissionsList: ServicePermissionsDescription[] = [];

  for (const stepFolderName of stepFolderNames) {
    if (!pathNamesToSkipReg.test(stepFolderName)) {
      try {
        const filePath = `${stepsFolderPath}/${stepFolderName}/${stepIndexFileName}`;
        const importedFile = await import(filePath);
        const camelCaseVariableName = `${stepFolderName.replace(/-./g, (x) =>
          x[1].toUpperCase(),
        )}Steps`;
        const stepsArrayVariable = importedFile[camelCaseVariableName];

        if (stepsArrayVariable) {
          const stepPermissionsArray = stepsArrayVariable.reduce(
            (accumulator, step) => {
              if (step.permissions) {
                return [...accumulator, ...step.permissions];
              }

              return accumulator;
            },
            [],
          );

          if (stepPermissionsArray.length > 0) {
            permissionsList = [
              ...permissionsList,
              { service: stepFolderName, permssions: stepPermissionsArray },
            ];
          }
        } else {
          console.log(
            `Unable to locate ${camelCaseVariableName} variable in ${camelCaseVariableName}.ts file inside ${stepFolderName} folder.`,
          );
        }
      } catch (error) {
        // TODO: handle error
      }
    }
  }

  const tableMarkdown = getTableMarkdown(permissionsList);

  return `${J1_PERMISSIONS_DOCUMENTATION_MARKER_START}\n${tableMarkdown}\n${J1_PERMISSIONS_DOCUMENTATION_MARKER_END}`;
}

function getTableMarkdown(
  permissionsList: ServicePermissionsDescription[],
): string {
  return table([
    ['Service', 'Permissions'],
    ...permissionsList.map((permission) => [
      permission.service,
      `\`${permission.permssions}\``,
    ]),
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
    return oldDocumentationFile + '\n\n' + newGeneratedDocumentationSection;
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
