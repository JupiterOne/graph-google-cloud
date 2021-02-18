# Google Cloud Integration Development

There are a few steps to take to setup Google Cloud integration development:

1. Identify an Google Cloud account for local development. It is highly
   recommended that you avoid targeting a production project, because tests rely
   on [Polly.js](https://github.com/Netflix/pollyjs) recordings for playback in
   CI/CD environments.
1. Create credentials with write permissions to configure
   `<graph-google-cloud>/terraform/.env`. The Terraform Google Cloud provider
   client needs more permissions than the integration itself.
1. Create a Google Cloud
   [service account](https://cloud.google.com/iam/docs/service-accounts) in the
   Google Cloud project to run the integration in with read permissions to
   configure `<graph-google-cloud>/.env`. The integration Google Cloud client
   will use this for ingesting information about the targeted project.

## Prerequisites

### Install the Google Cloud SDK CLI

Follow instructions to install the CLI here:
https://cloud.google.com/sdk/docs/quickstarts. After the CLI has been installed,
initialize the CLI and authenticate against the account that you wish to develop
the Google Cloud integration with.

```sh
gcloud init
```

### Creating Google Cloud Project

If this is your first time using the Google Cloud SDK CLI, you will be prompted
to choose a project or create a new project. Choose the "Create a new project"
option. It is highly recommended that you do not use a production Google Cloud
project to develop the integration.

Recommended defaults:

- Project Name: `j1-gc-integration-dev`

You may also run the following command to automatically create the Google Cloud
project using the recommended defaults:

```sh
gcloud projects create j1-gc-integration-dev
```

If you wish to create the Google Cloud project under a specific organization,
you must specify the `--organization` flag. For example:

```sh
gcloud projects create j1-gc-integration-dev --organization MY_ORG_ID_HERE
```

If you wish to create the Google Cloud project under a specific folder, you must
specify the `--folder` flag. For example:

```sh
gcloud projects create j1-gc-integration-dev --folder MY_FOLDER_ID
```

For more information and a list of all supported flags, see the
[`gcloud projects create` documentation](https://cloud.google.com/sdk/gcloud/reference/projects/create)

### Get Unique Project ID

Google Cloud projects IDs are globally unique and cannot be changed. If you
created a project using a name that already exists, a unique project ID will be
generated for you. You can get the project ID using the following command:

```sh
# Swap out "j1-gc-integration-dev" with the project name that you created
gcloud projects list --filter='name:j1-gc-integration-dev'
```

The output will look something like this:

```
PROJECT_ID              NAME  PROJECT_NUMBER
my-proj-id-123          test  848199124374
```

In the above case, your Google Cloud project ID would be `my-proj-id-123`. In
the remainder of this document, we will reference the project ID as
`MY_PROJECT_ID`.

### Set the `gcloud` default project

A default project can be set for the `gcloud` CLI using the following command:

```sh
gcloud config set project MY_PROJECT_ID
```

Alternatively, you can set the `CLOUDSDK_CORE_PROJECT` environment variable.

### Enabling Google Cloud services

Google Cloud by default does not have every service enabled (e.g. "Cloud
Functions"). Certain services need to be enabled for this integration to invoke
APIs. The `src/getStepStartStates.ts` file describes which steps can be invoked
given specific enabled Google Cloud services. To enable all of the integration
services, you can run the following command:

```sh
gcloud services enable \
  serviceusage.googleapis.com \
  cloudfunctions.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com \
  cloudkms.googleapis.com \
  container.googleapis.com
```

### Creating Google Cloud project service account

A
[Google Cloud service account](https://cloud.google.com/iam/docs/service-accounts)
and key is needed to run the integration. This will give the integration access
to invoke specific APIs. A service account can be created using
[`gcloud iam service-accounts create`](https://cloud.google.com/sdk/gcloud/reference/iam/service-accounts/create).

For example:

```sh
gcloud iam service-accounts create j1-gc-integration-dev-sa \
   --description "J1 Google Cloud integration execution"
```

### Bind IAM policy to integration service account

We must assign the correct permissions to the newly created service account for
the integration to be run. We recommend using the following roles managed by
Google Cloud:

- [`roles/iam.securityReviewer`](https://cloud.google.com/iam/docs/understanding-roles#iam.securityReviewer)
- [`roles/iam.roleViewer`](https://cloud.google.com/iam/docs/understanding-roles#iam.roleViewer)

To bind integration execution roles, run the
[`gcloud iam add-iam-policy-binding`](https://cloud.google.com/sdk/gcloud/reference/iam/service-accounts/add-iam-policy-binding)
command:

```sh
gcloud projects add-iam-policy-binding PROJECT_ID \
   --member serviceAccount:j1-gc-integration-dev-sa@PROJECT_ID.iam.gserviceaccount.com \
   --role "roles/iam.securityReviewer"

gcloud projects add-iam-policy-binding PROJECT_ID \
   --member serviceAccount:j1-gc-integration-dev-sa@PROJECT_ID.iam.gserviceaccount.com \
   --role "roles/iam.roleViewer"
```

NOTE: You must update the values above to match your service account details.

For example, if your `PROJECT_ID` is `my-proj-id-123`, the above command would
be:

```sh
gcloud projects add-iam-policy-binding my-proj-id-123 \
   --member serviceAccount:j1-gc-integration-dev-sa@my-proj-id-123.iam.gserviceaccount.com \
   --role "roles/iam.securityReviewer"
```

### Generate a service account key

A service account key will be used to to execute the integration. You can
generate a service account key using the
[`gcloud iam service-accounts keys create`](https://cloud.google.com/sdk/gcloud/reference/iam/service-accounts/keys/create)
command:

```sh
gcloud iam service-accounts keys create /PATH_TO_CREATE_KEY/service-account-key.json \
   --iam-account j1-gc-integration-dev-sa@PROJECT_ID.iam.gserviceaccount.com \
   --key-file-type "json"
```

NOTE: You must update the values above to match your service account details.

For example, if your `PROJECT_ID` is `my-proj-id-123` and you would like to
create the key on your desktop (on a UNIX environment):

```sh
gcloud iam service-accounts keys create ~/Desktop/service-account-key.json \
   --iam-account j1-gc-integration-dev-sa@my-proj-id-123.iam.gserviceaccount.com \
   --key-file-type "json"
```

### Create .env file

At the root of the project, create a `.env` file. The `.env` file should contain
properties from the service account key created above. A service account key
should look like this:

```json
{
  "type": "service_account",
  "project_id": "PROJECT_ID",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

A `SERVICE_ACCOUNT_KEY_FILE` property should be added to the `.env` file with
the value being the JSON stringified contents of the service account key file. A
helper script can be run that will automatically generate the `.env` file in the
correct format:

```bash
yarn create-env-file ~/SERVICE_ACCOUNT_FILE_PATH_HERE.json
```

### Run tests against Google Cloud project

Many of the tests are written to make API requests, with requests and responses
recorded by [Polly.js](https://github.com/Netflix/pollyjs) to allow for playback
in CI/CD environments. An
[integration configuration for testing](../test/config.ts) works to ensure that
there is an appropriate configuration to replay the recordings.

To run the tests locally against Google Cloud, run:

```sh
yarn test:env
```

To run the tests against the local recordings (offline testing):

```sh
yarn test
```

## Terraform setup

This project can be run by any developer, but if you are an internal JupiterOne
developer, please request access to the JupiterOne Terraform Cloud account. This
section will try to contain info on running Terraform in all the possible ways.

### Option A - You are an internal JupiterOne developer

You should have been invited to the JupiterOne Terraform Cloud account, if not
please request access.

1. Once you've created an account and have accepted the invitation please use
   the `terraform login` command. It should redirect you to the Terraform Cloud
   to generate an authentication token to be used locally.

2. Navigate to the Google Cloud project's terraform/ directory and create a
   main.remote.tf file with the following content:

```
terraform {
  backend "remote" {
    organization = "jupiterone"
    workspaces {
      name = "integration-development-google-cloud"
    }
  }
}
```

3. Delete .env in the terraform/ directory (if there were any).
4. Delete \*.tfstate file(s) in the terraform/ directory (if there were any).
5. Run `terraform init`
6. You can use `terraform plan` and `terraform apply` to compare the difference
   and apply your newest Terraform changes.

### Option B - You are a third-party developer

As a third party developer you have 2 options:

1. You can use Terraform Cloud
2. You can manage your environment variables directly from the .env file

### Option B - 1)

1. Setup Terraform Cloud account, create organization/project for this
   repository, and input your environment variables.

2. Use the `terraform login` command. It should redirect you to the Terraform
   Cloud to generate an authentication token to be used locally.

3. Navigate to the Google Cloud project's `terraform/` directory and create a
   main.remote.tf file with the following content:

```
terraform {
  backend "remote" {
    organization = "YOUR_ORG_NAME_HERE"
    workspaces {
      name = "YOUR_ORG_WORKSPACE_ID_HERE"
    }
  }
}
```

4. Delete .env in the terraform/ directory (if there were any).
5. Delete \*.tfstate file(s) in the terraform/ directory (if there were any).
6. Run `terraform init`
7. You can use `terraform plan` and `terraform apply` to compare the difference
   and apply your newest Terraform changes.

### Option B - 2)

1. Create a .env file inside the terraform/ directory and populate it with the
   necessary Terraform variables

2. Run `terraform init`

3. You can use `terraform plan` and `terraform apply` to compare the difference
   and apply your newest Terraform changes.

### Terraform environment variables

The following variables are necessary for the Terraform to work properly:

service_account_key

- Service account key to provision Terraform during integration development. Can
  be generated by running the command described in this document.

project_id

- Google Cloud project to provision resources into the correct project.

client_email

- Email of the service account used to provision Terraform during integration
  development.

project_id_number

- The unique ID number of the Google Cloud project to provision resources into.
  Can be found on the Google Cloud's dashboard page once the correct project is
  selected.

A small note: if you're using the .env approach, you'll need to preface the
variable names with `TF_VAR_`. Here's an example:

```
TF_VAR_service_account_key=<VALUE>
TF_VAR_project_id=<VALUE>
TF_VAR_client_email=<VALUE>
TF_VAR_project_id_number=<VALUE>
```

(terraform/.env file)
