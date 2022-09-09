# graph-google-cloud

## Development Environment

### Prerequisites

You must have Node.JS installed to run this project. If you don't already have
it installed, you can can download the installer
[here](https://nodejs.org/en/download/). You can alternatively install Node.JS
using a version manager like [fnm](https://github.com/Schniz/fnm) or
[nvm](https://github.com/nvm-sh/nvm).

### Setup

#### Installing dependencies

From the root of this project, run `npm install` to install dependencies. If you
have `yarn` installed, you can install dependencies by running `yarn`.

#### Loading credentials

Create a `.env` file at the root of this project and add environment variables
to match what is in `src/instanceConfigFields.ts`. The `.env` file is ignored by
git, so you won't have to worry about accidentally pushing credentials.

Given this example configuration:

```typescript
import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  clientId: {
    type: 'string',
  },
  clientSecret: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
```

You would provide a `.env` file like this:

```bash
CLIENT_ID="client-id"
CLIENT_SECRET="supersecret"
```

The snake cased environment variables will automatically be converted and
applied to the camel cased configuration field. So for example, `CLIENT_ID` will
apply to the `clientId` config field, `CLIENT_SECRET` will apply to
`clientSecret`, and `MY_SUPER_SECRET_CONFIGURATION_VALUE` will apply to a
`mySuperSecretConfigurationValue` configuration field.

## Running the integration

To start collecting data, run `yarn start` from the root of the project. This
will load in your configuration from `src/index.ts`.

## Documentation

### Development

Please reference the JupiterOne integration
[development documentation](https://github.com/JupiterOne/sdk/blob/master/docs/integrations/development.md)
for more information on how to use the SDK.

See [docs/development.md](docs/development.md) for details about how to get
started with developing this integration.

### Integration usage and resource coverage

More information about the resources covered by this integration and how to
setup the integration in JupiterOne can be found in
[docs/jupiterone.md](docs/jupiterone.md).

### Versioning this project

This project is versioned using [auto](https://intuit.github.io/auto/).

Versioning and publishing to NPM are now handled via adding GitHub labels to
pull requests. The following labels should be used for this process:

- patch
- minor
- major
- release

For each pull request, the degree of change should be registered by applying the
appropriate label of patch, minor, or major. This allows the repository to keep
track of the highest degree of change since the last release. When ready to
publish to NPM, the PR should have both its appropriate patch, minor, or major
label applied as well as a release label. The release label will denote to the
system that we need to publish to NPM and will correctly version based on the
highest degree of change since the last release, package the project, and
publish it to NPM.

### Changelog

The history of this integration's development can be viewed at
[CHANGELOG.md](CHANGELOG.md).
