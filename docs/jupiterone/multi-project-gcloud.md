## Integration Walkthrough for multi project using gcloud CLI tool

Given the correct permissions, JupiterOne has the ability to automatically
discover each project under a Google Cloud organization and configure
integration instances for each of the projects.

Customers authorize access by creating a
[Google Cloud service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
and providing the service account key to JupiterOne.

## Prerequisites

### Install the Google Cloud SDK CLI

Follow instructions to install the CLI here:
https://cloud.google.com/sdk/docs/quickstarts. After the CLI has been installed,
initialize the CLI and authenticate against the account that you wish to develop
the Google Cloud integration with.

```sh
gcloud init
```

### Set the `gcloud` default project

A default project can be set for the `gcloud` CLI using the following command:

```sh
gcloud config set project MY_PROJECT_ID
```

### Enabling Google Cloud services

A
[Google Cloud service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
and a
[Google Cloud service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)
must be created in order to run the integration. The service account key is used
to authenticate on behalf of the integration's Google Cloud project and ingest
data into JupiterOne.

Google Cloud has most API services disabled by default. When a Google Cloud
service API is disabled, the JupiterOne integration will not ingest the data
from that API. The following Google Cloud service APIs must be enabled to ingest
all of the supported data into JupiterOne:

| Service Name                                                                                                     | Service API                         |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [Service Usage](https://console.developers.google.com/apis/library/serviceusage.googleapis.com)                  | serviceusage.googleapis.com         |
| [Cloud Functions](https://console.developers.google.com/apis/library/cloudfunctions.googleapis.com)              | cloudfunctions.googleapis.com       |
| [Cloud Storage](https://console.developers.google.com/apis/library/storage.googleapis.com)                       | storage.googleapis.com              |
| [Identity and Access Management (IAM)](https://console.developers.google.com/apis/library/iam.googleapis.com)    | iam.googleapis.com                  |
| [Cloud Resource Manager](https://console.developers.google.com/apis/library/cloudresourcemanager.googleapis.com) | cloudresourcemanager.googleapis.com |
| [Cloud Engine](https://console.developers.google.com/apis/library/compute.googleapis.com)                        | compute.googleapis.com              |
| [Cloud Key Management Service (KMS)](https://console.developers.google.com/apis/library/cloudkms.googleapis.com) | cloudkms.googleapis.com             |
| [Cloud SQL](https://console.developers.google.com/apis/library/sqladmin.googleapis.com)                          | sqladmin.googleapis.com             |
| [BigQuery](https://console.developers.google.com/apis/library/bigquery.googleapis.com)                           | bigquery.googleapis.com             |
| [Cloud DNS](https://console.developers.google.com/apis/library/dns.googleapis.com)                               | dns.googleapis.com                  |
| [Kubernetes Engine](https://console.developers.google.com/apis/library/container.googleapis.com)                 | container.googleapis.com            |
| [Cloud Logging](https://console.developers.google.com/apis/library/logging.googleapis.com)                       | logging.googleapis.com              |
| [Stackdriver Monitoring](https://console.developers.google.com/apis/library/monitoring.googleapis.com)           | monitoring.googleapis.com           |
| [Binary Authorization](https://console.developers.google.com/apis/library/binaryauthorization.googleapis.com)    | binaryauthorization.googleapis.com  |
| [Cloud Pub/Sub](https://console.developers.google.com/apis/library/pubsub.googleapis.com)                        | pubsub.googleapis.com               |
| [App Engine Admin](https://console.developers.google.com/apis/library/appengine.googleapis.com)                  | appengine.googleapis.com            |
| [Cloud Run](https://console.developers.google.com/apis/library/run.googleapis.com)                               | run.googleapis.com                  |
| [Cloud Memorystore for Redis](https://console.developers.google.com/apis/library/redis.googleapis.com)           | redis.googleapis.com                |
| [Cloud Memorystore for Memcached](https://console.developers.google.com/apis/library/memcache.googleapis.com)    | memcache.googleapis.com             |
| [API Gateway](https://console.developers.google.com/apis/library/apigateway.googleapis.com)                      | apigateway.googleapis.com           |
| [Cloud Spanner](https://console.developers.google.com/apis/library/spanner.googleapis.com)                       | spanner.googleapis.com              |
| [Certificate Authority](https://console.developers.google.com/apis/library/privateca.googleapis.com)             | privateca.googleapis.com            |
| [Cloud Asset](https://console.developers.google.com/apis/library/cloudasset.googleapis.com)                      | cloudasset.googleapis.com           |
| [Access Context Manager](https://console.developers.google.com/apis/library/accesscontextmanager.googleapis.com) | accesscontextmanager.googleapis.com |

#### Enabling Google Cloud Service API from `gcloud` CLI

You can run the following command to enable all services that the JupiterOne
integration supports:

**NOTE** You can only enable 20 services at a time

```
gcloud services enable \
  serviceusage.googleapis.com \
  cloudfunctions.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com \
  cloudkms.googleapis.com \
  sqladmin.googleapis.com \
  bigquery.googleapis.com \
  container.googleapis.com \
  dns.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  binaryauthorization.googleapis.com \
  pubsub.googleapis.com \
  appengine.googleapis.com \
  run.googleapis.com \
  redis.googleapis.com \
  memcache.googleapis.com \
  apigateway.googleapis.com \
  spanner.googleapis.com \
  privateca.googleapis.com \
  cloudasset.googleapis.com \
  accesscontextmanager.googleapis.com
```

### Create a service account for the "main" project

Create a service account for Google Cloud project that will act as main project.

- **Main**: Main project represents the project that was selected when service
  account was created.

- **Child**: Child projects represent all the projects under the same
  organization that you wish integration to automatically

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

### Create custom role at organizational level

[Create a new custom role](https://cloud.google.com/iam/docs/creating-custom-roles)
with the following permissions:

```
resourcemanager.folders.get
resourcemanager.folders.list
resourcemanager.organizations.get
resourcemanager.projects.get
resourcemanager.projects.list
serviceusage.services.list
resourcemanager.organizations.getIamPolicy
cloudasset.assets.searchAllIamPolicies
```

Some additional data may be optionally ingested by the JupiterOne Google Cloud
integration by configuring a custom role with the following permissions:

```
appengine.applications.get
binaryauthorization.policy.get
compute.projects.get
```

The integration will also try to ingest organization policy for
"storage.publicAccessPrevention" to precisely calculate storage buckets public
access, it is therefore recommended that the following permission is also
included in the custom role above:

```
orgpolicy.policy.get
```

```sh
gcloud iam roles create myCustomRole --organization=organizationId \
  --title="My Custom Role" \
  --permissions=resourcemanager.folders.get,resourcemanager.folders.list,resourcemanager.organizations.get,resourcemanager.projects.get,resourcemanager.projects.list,serviceusage.services.list,resourcemanager.organizations.getIamPolicy,cloudasset.assets.searchAllIamPolicies
```

### Grant access to an organization

Navigate to the Cloud Resource Manager for that organization and
[add a new member (principal) to the organization](https://cloud.google.com/resource-manager/docs/access-control-org#gcloud_1).
The new member (principal) email address is the email address of the service
account that was created earlier. Select the new organization role that was
created above (without it integration won't be able to traverse the organization
and discover each project), as well as the Google Cloud managed role "Security
Reviewer" (`roles/iam.securityReviewer`) or an alternative JupiterOne custom
role that you've created.

### Generate a service account key

A service account key will be used to execute the integration. You can generate
a service account key using the
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

### In JupiterOne

1. From the configuration **Gear Icon**, select **Integrations**.
2. Scroll to the **Google Cloud** integration tile and click it.
3. Click the **Add Configuration** button and configure the following settings:

- Enter the **Account Name** by which you'd like to identify this Google Cloud
  account in JupiterOne. Ingested entities will have this value stored in
  `tag.AccountName` when **Tag with Account Name** is checked.
- Enter a **Description** that will further assist your team when identifying
  the integration instance.
- Select a **Polling Interval** that you feel is sufficient for your monitoring
  needs. You may leave this as `DISABLED` and manually execute the integration.

**NOTE**: The "Polling Interval" that is selected for the "main" integration
instances, will be the same polling interval that is used for each of the child
integration instances.

- Use the generated service account key as the value for the **Service Account
  Key File** field.

- Check the "Configure Organization Projects" checkbox
- Place the numerical value of the Google Cloud organization into the
  **Organization ID** text field (e.g. "1234567890")

4. Click **Create Configuration** once all values are provided.

**NOTE**: Depending on how many projects exist under a Google Cloud
organization, the auto-configuration process may take a few minutes to complete.
When the process has been completed, you will see your new integration instances
on the JupiterOne Google Cloud integration list page.

## How to Uninstall

1. From the configuration **Gear Icon**, select **Integrations**.
2. Scroll to the **Google Cloud** integration tile and click it.
3. Identify and click the **integration to delete**.
4. Click the **trash can** icon.
5. Click the **Remove** button to delete the integration.
