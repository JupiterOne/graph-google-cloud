## Integration Walkthrough for single project using GCP Console

Customers authorize access by creating a
[Google Cloud service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
and providing the service account key to JupiterOne.

### In Google Cloud

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

#### Enabling Google Cloud Service API from Google Cloud Console

1. Click on the service name link that you'd like to enable from the table above
2. Select your Google Cloud project from the project dropdown menu
3. Click the "Enable" button

#### Creating Google Cloud project service account

- See the
  [Google Cloud service account documentation](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating)
  for more information on how to create a service account in the project that
  you would like to ingest data from.

We must assign the correct permissions to the newly created service account for
the integration to be run. We recommend using the following roles managed by
Google Cloud:

- [`roles/iam.securityReviewer`](https://cloud.google.com/iam/docs/understanding-roles#iam.securityReviewer)
- [`roles/bigquery.metadataViewer`](https://cloud.google.com/bigquery/docs/access-control#bigquery.metadataViewer)

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

See the
[Google Cloud custom role documentation](https://cloud.google.com/iam/docs/creating-custom-roles#creating_a_custom_role)
for additional information on how custom roles can be configured and assigned.

#### Generate a service account key

- See the
  [Google Cloud service account key documentation](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys)
  for more information on how to create a service account key for the service
  account that you would like to ingest data using.

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
- Enter the **Servce Account Key File** contents of the Google Cloud service
  account.

4. Click **Create Configuration** once all values are provided.

## How to Uninstall

1. From the configuration **Gear Icon**, select **Integrations**.
2. Scroll to the **Google Cloud** integration tile and click it.
3. Identify and click the **integration to delete**.
4. Click the **trash can** icon.
5. Click the **Remove** button to delete the integration.
