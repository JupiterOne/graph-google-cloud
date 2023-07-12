# Google Cloud

## Google Cloud + JupiterOne Integration Benefits

- Visualize Google Cloud resources in the JupiterOne graph.
- Map Google users to employees in your JupiterOne account.
- Monitor visibility and governance of your Google Cloud environment by
  leveraging hundreds of out of the box queries.
- Monitor compliance against the Google Cloud CIS Framework and other security
  benchmarks using the JupiterOne compliance app.
- Monitor changes to your Google Cloud resources using multiple JupiterOne alert
  rule packs specific to Google Cloud.

## How it Works

- JupiterOne periodically fetches users and cloud resources from Google Cloud to
  update the graph.
- Write JupiterOne queries to review and monitor updates to the graph, or
  leverage existing queries.
- Configure alerts to take action when the JupiterOne graph changes, or leverage
  existing alerts.

## Requirements

- JupiterOne requires the contents of a Google Cloud service account key file
  with the correct API services enabled (see the **Integration Walkthrough**).
- You must have permission in JupiterOne to install new integrations.

## Support

If you need help with this integration, please contact
[JupiterOne Support](https://support.jupiterone.io).

## Integration Walkthrough

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

<!-- {J1_APIS_DOCUMENTATION_LINKS_MARKER_START} -->

| Service Name                                                                                                   | Service API                         |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [accesscontextmanager](https://console.developers.google.com/apis/library/accesscontextmanager.googleapis.com) | accesscontextmanager.googleapis.com |
| [apigateway](https://console.developers.google.com/apis/library/apigateway.googleapis.com)                     | apigateway.googleapis.com           |
| [appengine](https://console.developers.google.com/apis/library/appengine.googleapis.com)                       | appengine.googleapis.com            |
| [bigquery](https://console.developers.google.com/apis/library/bigquery.googleapis.com)                         | bigquery.googleapis.com             |
| [bigtable](https://console.developers.google.com/apis/library/bigtable.googleapis.com)                         | bigtable.googleapis.com             |
| [binaryauthorization](https://console.developers.google.com/apis/library/binaryauthorization.googleapis.com)   | binaryauthorization.googleapis.com  |
| [cloudasset](https://console.developers.google.com/apis/library/cloudasset.googleapis.com)                     | cloudasset.googleapis.com           |
| [cloudbilling](https://console.developers.google.com/apis/library/cloudbilling.googleapis.com)                 | cloudbilling.googleapis.com         |
| [cloudbuild](https://console.developers.google.com/apis/library/cloudbuild.googleapis.com)                     | cloudbuild.googleapis.com           |
| [cloudfunctions](https://console.developers.google.com/apis/library/cloudfunctions.googleapis.com)             | cloudfunctions.googleapis.com       |
| [cloudkms](https://console.developers.google.com/apis/library/cloudkms.googleapis.com)                         | cloudkms.googleapis.com             |
| [cloudsql](https://console.developers.google.com/apis/library/cloudsql.googleapis.com)                         | cloudsql.googleapis.com             |
| [compute](https://console.developers.google.com/apis/library/compute.googleapis.com)                           | compute.googleapis.com              |
| [container](https://console.developers.google.com/apis/library/container.googleapis.com)                       | container.googleapis.com            |
| [dataproc](https://console.developers.google.com/apis/library/dataproc.googleapis.com)                         | dataproc.googleapis.com             |
| [dns](https://console.developers.google.com/apis/library/dns.googleapis.com)                                   | dns.googleapis.com                  |
| [iam](https://console.developers.google.com/apis/library/iam.googleapis.com)                                   | iam.googleapis.com                  |
| [logging](https://console.developers.google.com/apis/library/logging.googleapis.com)                           | logging.googleapis.com              |
| [memcache](https://console.developers.google.com/apis/library/memcache.googleapis.com)                         | memcache.googleapis.com             |
| [monitoring](https://console.developers.google.com/apis/library/monitoring.googleapis.com)                     | monitoring.googleapis.com           |
| [orgpolicy](https://console.developers.google.com/apis/library/orgpolicy.googleapis.com)                       | orgpolicy.googleapis.com            |
| [osconfig](https://console.developers.google.com/apis/library/osconfig.googleapis.com)                         | osconfig.googleapis.com             |
| [privateca](https://console.developers.google.com/apis/library/privateca.googleapis.com)                       | privateca.googleapis.com            |
| [pubsub](https://console.developers.google.com/apis/library/pubsub.googleapis.com)                             | pubsub.googleapis.com               |
| [redis](https://console.developers.google.com/apis/library/redis.googleapis.com)                               | redis.googleapis.com                |
| [resourcemanager](https://console.developers.google.com/apis/library/resourcemanager.googleapis.com)           | resourcemanager.googleapis.com      |
| [run](https://console.developers.google.com/apis/library/run.googleapis.com)                                   | run.googleapis.com                  |
| [secretmanager](https://console.developers.google.com/apis/library/secretmanager.googleapis.com)               | secretmanager.googleapis.com        |
| [serviceusage](https://console.developers.google.com/apis/library/serviceusage.googleapis.com)                 | serviceusage.googleapis.com         |
| [source](https://console.developers.google.com/apis/library/source.googleapis.com)                             | source.googleapis.com               |
| [spanner](https://console.developers.google.com/apis/library/spanner.googleapis.com)                           | spanner.googleapis.com              |
| [storage](https://console.developers.google.com/apis/library/storage.googleapis.com)                           | storage.googleapis.com              |
| [websecurityscanner](https://console.developers.google.com/apis/library/websecurityscanner.googleapis.com)     | websecurityscanner.googleapis.com   |
<!-- {J1_APIS_DOCUMENTATION_LINKS_MARKER_END} -->

Google Cloud service APIs can be enabled using one of the following methods:

#### Enabling Google Cloud Service API from Google Cloud Console

1.  Click on the service name link that you'd like to enable from the table
    above
2.  Select your Google Cloud project from the project dropdown menu
3.  Click the "Enable" button

#### Enabling Google Cloud Service API from `gcloud` CLI

Instructions on how to set up
the[`gcloud` CLI](https://cloud.google.com/sdk/gcloud) can be found in the
[JupiterOne Google Cloud integration developer documentation](https://github.com/JupiterOne/graph-google-cloud/blob/master/docs/development.md).

After setting up the [`gcloud` CLI](https://cloud.google.com/sdk/gcloud), you
can run the following command to enable all services that the JupiterOne
integration supports:

**NOTE**: You can only enable 20 services at a time.

<!-- {J1_APIS_DOCUMENTATION_MARKER_START} -->
    
```
gcloud services enable \
 accesscontextmanager.googleapis.com \
 apigateway.googleapis.com \
 appengine.googleapis.com \
 bigquery.googleapis.com \
 bigtable.googleapis.com \
 binaryauthorization.googleapis.com \
 cloudasset.googleapis.com \
 cloudbilling.googleapis.com \
 cloudbuild.googleapis.com \
 cloudfunctions.googleapis.com \
 cloudkms.googleapis.com \
 cloudsql.googleapis.com \
 compute.googleapis.com \
 container.googleapis.com \
 dataproc.googleapis.com \
 dns.googleapis.com \
 iam.googleapis.com \
 logging.googleapis.com \
 memcache.googleapis.com \
 monitoring.googleapis.com \
 orgpolicy.googleapis.com \
 osconfig.googleapis.com \
 privateca.googleapis.com \
 pubsub.googleapis.com \
 redis.googleapis.com \
 resourcemanager.googleapis.com \
 run.googleapis.com \
 secretmanager.googleapis.com \
 serviceusage.googleapis.com \
 source.googleapis.com \
 spanner.googleapis.com \
 storage.googleapis.com \
 websecurityscanner.googleapis.com
  ```
<!-- {J1_APIS_DOCUMENTATION_MARKER_END} -->

#### Creating Google Cloud project service account

- See the
  [Google Cloud service account documentation](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating)
  for more information on how to create a service account in the project that
  you would like to ingest data from.

We must assign the correct permissions to the newly created service account for
the integration to be run. We recommend using the following roles managed by
Google Cloud:

- [`Security Reviewer`](https://cloud.google.com/iam/docs/understanding-roles#iam.securityReviewer)
- [`Organization Role Viewer`](https://cloud.google.com/iam/docs/understanding-roles#iam.organizationRoleViewer)
- [`BigQuery Metadata Viewer`](https://cloud.google.com/bigquery/docs/access-control#bigquery.metadataViewer)
- [`Secret Manager Secret Accessor`](https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#access)

Some additional data may be optionally ingested by the JupiterOne Google Cloud
integration by configuring a custom role with the following permissions:

    appengine.applications.get
    binaryauthorization.policy.get
    cloudasset.assets.searchAllIamPolicies
    compute.projects.get
    orgpolicy.policy.get

For BigQuery, the following _additional_ permissions are needed to ingest
BigQuery datasets, models, and tables respectively:

    bigquery.datasets.get
    bigquery.models.getMetadata
    bigquery.tables.get

See the
[Google Cloud custom role documentation](https://cloud.google.com/iam/docs/creating-custom-roles#creating_a_custom_role)
for additional information on how custom roles can be configured and assigned.

NOTE: You may also create a service account using the
[`gcloud` CLI](https://cloud.google.com/sdk/gcloud). There is documentation on
how to leverage the CLI in the
[JupiterOne Google Cloud integration developer documentation](https://github.com/JupiterOne/graph-google-cloud/blob/master/docs/development.md).

#### Generate a service account key

- See the
  [Google Cloud service account key documentation](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys)
  for more information on how to create a service account key for the service
  account that you would like to ingest data using.

NOTE: You may also create a service account key using the
[`gcloud` CLI](https://cloud.google.com/sdk/gcloud). There is documentation on
how to leverage the CLI in the
[Google Cloud integration developer documentation](https://github.com/JupiterOne/graph-google-cloud/blob/master/docs/development.md).

#### JupiterOne + Google Cloud Organization

Given the correct permissions, JupiterOne has the ability to automatically
discover each project under a Google Cloud organization and configure
integration instances for each of the projects.

##### Setup

1.  Select one Google Cloud project to configure a service account for
    JupiterOne.
2.  Create the service account without a role. Copy the email address of the new
    service account (e.g. `my-sa@my-j1-project.iam.gserviceaccount.com`).
3.  Generate and copy a new service account key.
4.  Enable all service APIs in the "main" project and each "child" project that
    you'd like JupiterOne to access. Documentation for enabling service APIs is
    described in an earlier section of this document.

    **NOTE**: The "Cloud Asset" and "Identity and Access Management (IAM)" APIs
    only need to be enabled in the "main" project.

5.  Switch to the organization that you'd like to create individual integration
    instances for each project
6.  [Create a new custom role](https://cloud.google.com/iam/docs/creating-custom-roles)
    with the following permissions:

<!---->

    resourcemanager.folders.get
    resourcemanager.folders.list
    resourcemanager.organizations.get
    resourcemanager.projects.get
    resourcemanager.projects.list
    serviceusage.services.list
    resourcemanager.organizations.getIamPolicy
    cloudasset.assets.searchAllIamPolicies

The integration will also try to ingest organization policy for
"storage.publicAccessPrevention" to precisely calculate storage buckets public
access, it is therefore recommended that the following permission is also
included in the custom role above:

    orgpolicy.policy.get

1.  Navigate to the Cloud Resource Manager for that organization and
    [add a new member to the organization](https://cloud.google.com/resource-manager/docs/access-control-org#grant-access).
    The new member email address is the email address of the service account
    that was created earlier. Select the new organization role that was created
    above, as well as the Google Cloud managed role "Security Reviewer"
    (`roles/iam.securityReviewer`) or an alternative JupiterOne custom role that
    you've created.

2.  Navigate to the JupiterOne Google Cloud integration configuration page to
    begin configuring the "main" integration instance.

Use the generated service account key as the value for the "Service Account Key
File" field.

**NOTE**: The "Polling Interval" that is selected for the "main" integration
instances will be the same polling interval that is used for each of the child
integration instances.

1.  Select the "Configure Organization Projects" checkbox.
2.  Place the numerical value of the Google Cloud organization into the
    "Organization ID" text field (e.g. "1234567890").
3.  Click `CREATE CONFIGURATION`.

**NOTE**: Depending on how many projects exist under a Google Cloud
organization, the auto-configuration process may take a few minutes to complete.
When the process has been completed, you will see your new integration instances
on the JupiterOne Google Cloud integration list page.

### In JupiterOne

1. From the top navigation of the J1 Search homepage, select **Integrations**.
2. Scroll to the **Google Cloud** integration tile and click it.
3. Click the **Add Configuration** button and configure the following settings:

   - Enter the **Account Name** by which you'd like to identify this Google
     Cloud account in JupiterOne. Ingested entities will have this value stored
     in `tag.AccountName` when **Add AccountName Tag** is enabled.

   - Enter a **Description** that will assist your team to identify the
     integration instance.

   - Select a **Polling Interval** that you feel is sufficient for your
     monitoring needs. You can leave this as `DISABLED` and manually execute the
     integration.

   - Enter the **Service Account Key File** contents of the Google Cloud service
     account.

   - Add any tags you want to use to simplify data management and queries.

4. Optionally, enter a project ID to target for data ingestion. The default is
   the project ID specified in the service account key file.

5. Select **Configure Organization Projects** if you want J1 to auto-configure
   all projects in your organization. J1 applies the configuration to all other
   projects that do not have optional `j1-integration: SKIP` tag applied to the
   project in your infrastructure-as-code. Do not use the optional project ID if
   you want to use this feature.

6. Optionally, enter a numerical folder ID if you want to specify that J1 is to
   only ingest projects in a specific folder and any of its subfolders. If you
   have enabled **Configure Organization Projects**, J1 only auto-configures
   projects in this specified folder.

7. Click **Create** after you have provided all the configuration values.

## How to Uninstall

1.  From the top navigation of the J1 Search homepage, select **Integrations**.
2.  Scroll to the **Google Cloud** integration tile and click it.
3.  Identify and click the **integration to delete**.
4.  Click the **trash can** icon.
5.  Click the **Remove** button to delete the integration.

<!-- {J1_DOCUMENTATION_MARKER_START} -->
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-integration document" COMMAND. DO NOT EDIT BY HAND! PLEASE SEE THE DEVELOPER
DOCUMENTATION FOR USAGE INFORMATION:

https://github.com/JupiterOne/sdk/blob/main/docs/integrations/development.md
********************************************************************************
-->

## Data Model

### Entities

The following entities are created:

| Resources                                                | Entity `_type`                                                    | Entity `_class`                    |
| -------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| Access Context Manager Access Level                      | `google_access_context_manager_access_level`                      | `Ruleset`                          |
| Access Context Manager Access Policy                     | `google_access_context_manager_access_policy`                     | `AccessPolicy`                     |
| Access Context Manager Service Perimeter                 | `google_access_context_manager_service_perimeter`                 | `Configuration`                    |
| Access Context Manager Service Perimeter Api Operation   | `google_access_context_manager_service_perimeter_api_operation`   | `Configuration`                    |
| Access Context Manager Service Perimeter Egress Policy   | `google_access_context_manager_service_perimeter_egress_policy`   | `ControlPolicy`                    |
| Access Context Manager Service Perimeter Ingress Policy  | `google_access_context_manager_service_perimeter_ingress_policy`  | `ControlPolicy`                    |
| Access Context Manager Service Perimeter Method Selector | `google_access_context_manager_service_perimeter_method_selector` | `Configuration`                    |
| Api Gateway Api                                          | `google_api_gateway_api`                                          | `Service`                          |
| Api Gateway Api Config                                   | `google_api_gateway_api_config`                                   | `Configuration`                    |
| Api Gateway Gateway                                      | `google_api_gateway_gateway`                                      | `Gateway`                          |
| AppEngine Application                                    | `google_app_engine_application`                                   | `Application`                      |
| AppEngine Instance                                       | `google_app_engine_instance`                                      | `Host`                             |
| AppEngine Service                                        | `google_app_engine_service`                                       | `Container`                        |
| AppEngine Version                                        | `google_app_engine_version`                                       | `Service`                          |
| Audit Config                                             | `google_cloud_audit_config`                                       | `Configuration`                    |
| Big Query Dataset                                        | `google_bigquery_dataset`                                         | `DataStore`, `Database`            |
| Big Query Model                                          | `google_bigquery_model`                                           | `Model`                            |
| Big Query Table                                          | `google_bigquery_table`                                           | `DataCollection`                   |
| Bigtable AppProfile                                      | `google_bigtable_app_profile`                                     | `Configuration`                    |
| Bigtable Backup                                          | `google_bigtable_backup`                                          | `Backup`                           |
| Bigtable Cluster                                         | `google_bigtable_cluster`                                         | `Cluster`                          |
| Bigtable Instance                                        | `google_bigtable_instance`                                        | `Database`                         |
| Bigtable Table                                           | `google_bigtable_table`                                           | `DataCollection`                   |
| Billing Account                                          | `google_billing_account`                                          | `Account`                          |
| Billing Budget                                           | `google_billing_budget`                                           | `Ruleset`                          |
| Binary Authorization Policy                              | `google_binary_authorization_policy`                              | `AccessPolicy`                     |
| Cloud API Service                                        | `google_cloud_api_service`                                        | `Service`                          |
| Cloud Build                                              | `google_cloud_build`                                              | `Workflow`                         |
| Cloud Build BitBucket Server Config                      | `google_cloud_bitbucket_server_config`                            | `Configuration`                    |
| Cloud Build BitBucket Server Repo                        | `google_cloud_bitbucket_server_repo`                              | `CodeRepo`                         |
| Cloud Build GitHub Enterprise Config                     | `google_cloud_github_enterprise_config`                           | `Configuration`                    |
| Cloud Build Trigger                                      | `google_cloud_build_trigger`                                      | `Rule`                             |
| Cloud Build Worker Pool                                  | `google_cloud_build_worker_pool`                                  | `Cluster`                          |
| Cloud Function                                           | `google_cloud_function`                                           | `Function`                         |
| Cloud Run Configuration                                  | `google_cloud_run_configuration`                                  | `Configuration`                    |
| Cloud Run Route                                          | `google_cloud_run_route`                                          | `Configuration`                    |
| Cloud Run Service                                        | `google_cloud_run_service`                                        | `Service`                          |
| Cloud Source Repository                                  | `google_cloud_source_repository`                                  | `CodeRepo`                         |
| Cloud Storage Bucket                                     | `google_storage_bucket`                                           | `DataStore`                        |
| Compute Address                                          | `google_compute_address`                                          | `IpAddress`                        |
| Compute Backend Bucket                                   | `google_compute_backend_bucket`                                   | `Gateway`                          |
| Compute Backend Service                                  | `google_compute_backend_service`                                  | `Service`                          |
| Compute Disk                                             | `google_compute_disk`                                             | `DataStore`, `Disk`                |
| Compute Firewalls                                        | `google_compute_firewall`                                         | `Firewall`                         |
| Compute Forwarding Rule                                  | `google_compute_forwarding_rule`                                  | `Configuration`                    |
| Compute Global Address                                   | `google_compute_global_address`                                   | `IpAddress`                        |
| Compute Global Forwarding Rule                           | `google_compute_global_forwarding_rule`                           | `Configuration`                    |
| Compute Image                                            | `google_compute_image`                                            | `Image`                            |
| Compute Instance                                         | `google_compute_instance`                                         | `Host`                             |
| Compute Instance Group                                   | `google_compute_instance_group`                                   | `Group`                            |
| Compute Instance Group Named Port                        | `google_compute_instance_group_named_port`                        | `Configuration`                    |
| Compute Networks                                         | `google_compute_network`                                          | `Network`                          |
| Compute Project                                          | `google_compute_project`                                          | `Project`                          |
| Compute Region Health Check                              | `google_compute_health_check`                                     | `Service`                          |
| Compute Region Load Balancer                             | `google_compute_url_map`                                          | `Gateway`                          |
| Compute Region Target HTTP Proxy                         | `google_compute_target_http_proxy`                                | `Gateway`                          |
| Compute Region Target HTTPS Proxy                        | `google_compute_target_https_proxy`                               | `Gateway`                          |
| Compute SSL Policy                                       | `google_compute_ssl_policy`                                       | `Policy`                           |
| Compute Snapshot                                         | `google_compute_snapshot`                                         | `Image`                            |
| Compute Subnetwork                                       | `google_compute_subnetwork`                                       | `Network`                          |
| Compute Target SSL Proxy                                 | `google_compute_target_ssl_proxy`                                 | `Gateway`                          |
| Container Cluster                                        | `google_container_cluster`                                        | `Cluster`                          |
| Container Node Pool                                      | `google_container_node_pool`                                      | `Group`                            |
| DNS Managed Zone                                         | `google_dns_managed_zone`                                         | `DomainZone`                       |
| DNS Policy                                               | `google_dns_policy`                                               | `Ruleset`                          |
| Dataproc Cluster                                         | `google_dataproc_cluster`                                         | `Cluster`                          |
| Folder                                                   | `google_cloud_folder`                                             | `Group`                            |
| IAM Binding                                              | `google_iam_binding`                                              | `AccessPolicy`                     |
| IAM Custom Role                                          | `google_iam_role`                                                 | `AccessRole`                       |
| IAM Service Account                                      | `google_iam_service_account`                                      | `User`                             |
| IAM Service Account Key                                  | `google_iam_service_account_key`                                  | `AccessKey`                        |
| KMS Crypto Key                                           | `google_kms_crypto_key`                                           | `Key`, `CryptoKey`                 |
| KMS Key Ring                                             | `google_kms_key_ring`                                             | `Vault`                            |
| Logging Metric                                           | `google_logging_metric`                                           | `Configuration`                    |
| Logging Project Sink                                     | `google_logging_project_sink`                                     | `Logs`                             |
| Memcache Instance                                        | `google_memcache_instance`                                        | `Database`, `DataStore`, `Cluster` |
| Memcache Instance Node                                   | `google_memcache_instance_node`                                   | `Database`, `DataStore`, `Host`    |
| Monitoring Alert Policy                                  | `google_monitoring_alert_policy`                                  | `Policy`                           |
| Organization                                             | `google_cloud_organization`                                       | `Organization`                     |
| Private CA Certificate                                   | `google_privateca_certificate`                                    | `Certificate`                      |
| Private CA Certificate Authority                         | `google_privateca_certificate_authority`                          | `Service`                          |
| Private CA Pool                                          | `google_privateca_pool`                                           | `Group`                            |
| Project                                                  | `google_cloud_project`                                            | `Account`                          |
| PubSub Subscription                                      | `google_pubsub_subscription`                                      | `Service`                          |
| PubSub Topic                                             | `google_pubsub_topic`                                             | `Channel`                          |
| Redis Instance                                           | `google_redis_instance`                                           | `Database`, `DataStore`, `Host`    |
| SQL Admin MySQL Instance                                 | `google_sql_mysql_instance`                                       | `Database`                         |
| SQL Admin Postgres Instance                              | `google_sql_postgres_instance`                                    | `Database`                         |
| SQL Admin SQL Server Instance                            | `google_sql_sql_server_instance`                                  | `Database`                         |
| Scan Config                                              | `google_cloud_scan_config`                                        | `Configuration`                    |
| Scan Run                                                 | `google_cloud_scan_run`                                           | `Process`, `Task`                  |
| Secret                                                   | `google_secret_manager_secret`                                    | `Group`                            |
| Secret Version                                           | `google_secret_manager_secret_version`                            | `Secret`                           |
| Spanner Instance                                         | `google_spanner_instance`                                         | `Database`, `Cluster`              |
| Spanner Instance Config                                  | `google_spanner_instance_config`                                  | `Configuration`                    |
| Spanner Instance Database                                | `google_spanner_database`                                         | `Database`                         |

### Relationships

The following relationships are created:

| Source Entity `_type`                                            | Relationship `_class` | Target Entity `_type`                                             |
| ---------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------- |
| `google_access_context_manager_access_policy`                    | **HAS**               | `google_access_context_manager_access_level`                      |
| `google_access_context_manager_access_policy`                    | **HAS**               | `google_access_context_manager_service_perimeter`                 |
| `google_access_context_manager_service_perimeter_api_operation`  | **HAS**               | `google_access_context_manager_service_perimeter_method_selector` |
| `google_access_context_manager_service_perimeter_egress_policy`  | **HAS**               | `google_access_context_manager_service_perimeter_api_operation`   |
| `google_access_context_manager_service_perimeter`                | **HAS**               | `google_access_context_manager_service_perimeter_egress_policy`   |
| `google_access_context_manager_service_perimeter`                | **HAS**               | `google_access_context_manager_service_perimeter_ingress_policy`  |
| `google_access_context_manager_service_perimeter_ingress_policy` | **HAS**               | `google_access_context_manager_service_perimeter_api_operation`   |
| `google_access_context_manager_service_perimeter`                | **LIMITS**            | `google_cloud_api_service`                                        |
| `google_access_context_manager_service_perimeter`                | **PROTECTS**          | `google_cloud_project`                                            |
| `google_api_gateway_api_config`                                  | **USES**              | `google_iam_service_account`                                      |
| `google_api_gateway_api`                                         | **HAS**               | `google_api_gateway_gateway`                                      |
| `google_api_gateway_api`                                         | **USES**              | `google_api_gateway_api_config`                                   |
| `google_app_engine_application`                                  | **HAS**               | `google_app_engine_service`                                       |
| `google_app_engine_application`                                  | **USES**              | `google_storage_bucket`                                           |
| `google_app_engine_service`                                      | **HAS**               | `google_app_engine_version`                                       |
| `google_app_engine_version`                                      | **HAS**               | `google_app_engine_instance`                                      |
| `google_bigquery_dataset`                                        | **HAS**               | `google_bigquery_model`                                           |
| `google_bigquery_dataset`                                        | **HAS**               | `google_bigquery_table`                                           |
| `google_bigquery_dataset`                                        | **USES**              | `google_kms_crypto_key`                                           |
| `google_bigtable_cluster`                                        | **HAS**               | `google_bigtable_backup`                                          |
| `google_bigtable_cluster`                                        | **USES**              | `google_kms_crypto_key`                                           |
| `google_bigtable_instance`                                       | **HAS**               | `google_bigtable_app_profile`                                     |
| `google_bigtable_instance`                                       | **HAS**               | `google_bigtable_cluster`                                         |
| `google_bigtable_instance`                                       | **HAS**               | `google_bigtable_table`                                           |
| `google_bigtable_table`                                          | **HAS**               | `google_bigtable_backup`                                          |
| `google_billing_account`                                         | **HAS**               | `google_billing_budget`                                           |
| `google_cloud_api_service`                                       | **HAS**               | `google_iam_role`                                                 |
| `google_cloud_api_service`                                       | **HAS**               | `resource`                                                        |
| `google_cloud_api_service`                                       | **USES**              | `google_cloud_audit_config`                                       |
| `google_cloud_audit_config`                                      | **ALLOWS**            | `google_domain`                                                   |
| `google_cloud_audit_config`                                      | **ALLOWS**            | `google_group`                                                    |
| `google_cloud_audit_config`                                      | **ALLOWS**            | `google_iam_service_account`                                      |
| `google_cloud_audit_config`                                      | **ALLOWS**            | `google_user`                                                     |
| `google_cloud_bitbucket_server_config`                           | **HAS**               | `google_cloud_bitbucket_server_repo`                              |
| `google_cloud_build_trigger`                                     | **TRIGGERS**          | `google_cloud_build`                                              |
| `google_cloud_build`                                             | **USES**              | `google_cloud_source_repository`                                  |
| `google_cloud_build`                                             | **USES**              | `google_storage_bucket`                                           |
| `internet`                                                       | **ALLOWS**            | `google_compute_firewall`                                         |
| `google_cloud_folder`                                            | **HAS**               | `google_cloud_folder`                                             |
| `google_cloud_function`                                          | **USES**              | `google_iam_service_account`                                      |
| `google_cloud_function`                                          | **USES**              | `google_cloud_source_repository`                                  |
| `google_cloud_function`                                          | **USES**              | `google_storage_bucket`                                           |
| `google_cloud_organization`                                      | **HAS**               | `google_cloud_folder`                                             |
| `google_cloud_project`                                           | **HAS**               | `google_cloud_api_service`                                        |
| `google_cloud_project`                                           | **HAS**               | `google_billing_budget`                                           |
| `google_cloud_project`                                           | **HAS**               | `google_binary_authorization_policy`                              |
| `google_cloud_run_service`                                       | **MANAGES**           | `google_cloud_run_configuration`                                  |
| `google_cloud_run_service`                                       | **MANAGES**           | `google_cloud_run_route`                                          |
| `google_cloud_scan_config`                                       | **PERFORMED**         | `google_cloud_scan_run`                                           |
| `google_compute_backend_bucket`                                  | **HAS**               | `google_storage_bucket`                                           |
| `google_compute_backend_service`                                 | **HAS**               | `google_compute_health_check`                                     |
| `google_compute_backend_service`                                 | **HAS**               | `google_compute_instance_group`                                   |
| `google_compute_backend_service`                                 | **HAS**               | `google_compute_target_ssl_proxy`                                 |
| `google_compute_disk`                                            | **CREATED**           | `google_compute_snapshot`                                         |
| `google_compute_disk`                                            | **USES**              | `google_compute_image`                                            |
| `google_compute_disk`                                            | **USES**              | `google_kms_crypto_key`                                           |
| `google_compute_firewall`                                        | **PROTECTS**          | `google_compute_network`                                          |
| `google_compute_forwarding_rule`                                 | **CONNECTS**          | `google_compute_backend_service`                                  |
| `google_compute_forwarding_rule`                                 | **CONNECTS**          | `google_compute_network`                                          |
| `google_compute_forwarding_rule`                                 | **CONNECTS**          | `google_compute_subnetwork`                                       |
| `google_compute_forwarding_rule`                                 | **CONNECTS**          | `google_compute_target_http_proxy`                                |
| `google_compute_forwarding_rule`                                 | **CONNECTS**          | `google_compute_target_https_proxy`                               |
| `google_compute_forwarding_rule`                                 | **USES**              | `google_compute_address`                                          |
| `google_compute_global_forwarding_rule`                          | **CONNECTS**          | `google_compute_backend_service`                                  |
| `google_compute_global_forwarding_rule`                          | **CONNECTS**          | `google_compute_network`                                          |
| `google_compute_global_forwarding_rule`                          | **CONNECTS**          | `google_compute_subnetwork`                                       |
| `google_compute_global_forwarding_rule`                          | **CONNECTS**          | `google_compute_target_http_proxy`                                |
| `google_compute_global_forwarding_rule`                          | **CONNECTS**          | `google_compute_target_https_proxy`                               |
| `google_compute_image`                                           | **USES**              | `google_compute_image`                                            |
| `google_compute_image`                                           | **USES**              | `google_kms_crypto_key`                                           |
| `google_compute_instance_group`                                  | **HAS**               | `google_compute_instance`                                         |
| `google_compute_instance_group`                                  | **HAS**               | `google_compute_instance_group_named_port`                        |
| `google_compute_instance`                                        | **TRUSTS**            | `google_iam_service_account`                                      |
| `google_compute_instance`                                        | **USES**              | `google_compute_address`                                          |
| `google_compute_instance`                                        | **USES**              | `google_compute_disk`                                             |
| `google_compute_network`                                         | **CONNECTS**          | `google_compute_network`                                          |
| `google_compute_network`                                         | **CONTAINS**          | `google_compute_subnetwork`                                       |
| `google_compute_network`                                         | **HAS**               | `google_compute_address`                                          |
| `google_compute_network`                                         | **HAS**               | `google_dns_policy`                                               |
| `google_compute_network`                                         | **HAS**               | `google_compute_firewall`                                         |
| `google_compute_network`                                         | **HAS**               | `google_compute_global_address`                                   |
| `google_compute_project`                                         | **HAS**               | `google_compute_instance`                                         |
| `google_compute_snapshot`                                        | **CREATED**           | `google_compute_image`                                            |
| `google_compute_subnetwork`                                      | **HAS**               | `google_compute_address`                                          |
| `google_compute_subnetwork`                                      | **HAS**               | `google_compute_global_address`                                   |
| `google_compute_subnetwork`                                      | **HAS**               | `google_compute_instance`                                         |
| `google_compute_target_https_proxy`                              | **HAS**               | `google_compute_ssl_policy`                                       |
| `google_compute_target_ssl_proxy`                                | **HAS**               | `google_compute_ssl_policy`                                       |
| `google_compute_url_map`                                         | **HAS**               | `google_compute_backend_bucket`                                   |
| `google_compute_url_map`                                         | **HAS**               | `google_compute_backend_service`                                  |
| `google_compute_url_map`                                         | **HAS**               | `google_compute_target_http_proxy`                                |
| `google_compute_url_map`                                         | **HAS**               | `google_compute_target_https_proxy`                               |
| `google_container_cluster`                                       | **HAS**               | `google_container_node_pool`                                      |
| `google_container_node_pool`                                     | **HAS**               | `google_compute_instance_group`                                   |
| `google_dataproc_cluster`                                        | **USES**              | `google_compute_image`                                            |
| `google_dataproc_cluster`                                        | **USES**              | `google_kms_crypto_key`                                           |
| `google_dataproc_cluster`                                        | **USES**              | `google_storage_bucket`                                           |
| `google_cloud_folder`                                            | **HAS**               | `google_cloud_project`                                            |
| `google_iam_binding`                                             | **ALLOWS**            | `resource`                                                        |
| `google_iam_binding`                                             | **ASSIGNED**          | `google_cloud_authenticated_users`                                |
| `google_iam_binding`                                             | **ASSIGNED**          | `google_domain`                                                   |
| `google_iam_binding`                                             | **ASSIGNED**          | `everyone`                                                        |
| `google_iam_binding`                                             | **ASSIGNED**          | `google_group`                                                    |
| `google_iam_binding`                                             | **ASSIGNED**          | `google_iam_role`                                                 |
| `google_iam_binding`                                             | **ASSIGNED**          | `google_iam_service_account`                                      |
| `google_iam_binding`                                             | **ASSIGNED**          | `google_user`                                                     |
| `google_iam_binding`                                             | **USES**              | `google_iam_role`                                                 |
| `google_iam_service_account`                                     | **CREATED**           | `google_app_engine_version`                                       |
| `google_iam_service_account`                                     | **HAS**               | `google_iam_service_account_key`                                  |
| `google_kms_key_ring`                                            | **HAS**               | `google_kms_crypto_key`                                           |
| `google_logging_metric`                                          | **HAS**               | `google_monitoring_alert_policy`                                  |
| `google_logging_project_sink`                                    | **USES**              | `google_storage_bucket`                                           |
| `google_memcache_instance`                                       | **HAS**               | `google_memcache_instance_node`                                   |
| `google_memcache_instance`                                       | **USES**              | `google_compute_network`                                          |
| `google_cloud_organization`                                      | **HAS**               | `google_cloud_project`                                            |
| `google_privateca_certificate_authority`                         | **CREATED**           | `google_privateca_certificate`                                    |
| `google_privateca_certificate_authority`                         | **USES**              | `google_storage_bucket`                                           |
| `google_privateca_pool`                                          | **HAS**               | `google_privateca_certificate_authority`                          |
| `google_pubsub_subscription`                                     | **USES**              | `google_pubsub_topic`                                             |
| `google_pubsub_topic`                                            | **USES**              | `google_kms_crypto_key`                                           |
| `google_redis_instance`                                          | **USES**              | `google_compute_network`                                          |
| `google_secret_manager_secret`                                   | **HAS**               | `google_secret_manager_secret_version`                            |
| `google_spanner_database`                                        | **USES**              | `google_kms_crypto_key`                                           |
| `google_spanner_instance`                                        | **HAS**               | `google_spanner_database`                                         |
| `google_spanner_instance`                                        | **USES**              | `google_spanner_instance_config`                                  |
| `google_sql_mysql_instance`                                      | **USES**              | `google_kms_crypto_key`                                           |
| `google_sql_postgres_instance`                                   | **USES**              | `google_kms_crypto_key`                                           |
| `google_sql_sql_server_instance`                                 | **USES**              | `google_kms_crypto_key`                                           |
| `google_user`                                                    | **CREATED**           | `google_app_engine_version`                                       |

### Mapped Relationships

The following mapped relationships are created:

| Source Entity `_type`        | Relationship `_class` | Target Entity `_type` | Direction |
| ---------------------------- | --------------------- | --------------------- | --------- |
| `google_cloud_build_trigger` | **USES**              | `*github_repo*`       | FORWARD   |

<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
<!-- {J1_DOCUMENTATION_MARKER_END} -->

<!--  jupiterOneDocVersion=2-15-2-beta-4 -->

#### Google Cloud Specific Permissions List

If you prefer not to use Google managed roles, the following list of specific
permissions can be used to provision only the required ones:

<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_START} -->

| Permissions List (112)                                  |
| ------------------------------------------------------- |
| `accesscontextmanager.accessLevels.list`                |
| `accesscontextmanager.accessPolicies.list`              |
| `accesscontextmanager.servicePerimeters.list`           |
| `apigateway.apiconfigs.getIamPolicy`                    |
| `apigateway.apiconfigs.list`                            |
| `apigateway.apis.getIamPolicy`                          |
| `apigateway.apis.list`                                  |
| `apigateway.gateways.getIamPolicy`                      |
| `apigateway.gateways.list`                              |
| `appengine.applications.get`                            |
| `appengine.instances.list`                              |
| `appengine.services.list`                               |
| `appengine.versions.list`                               |
| `bigquery.datasets.get`                                 |
| `bigquery.models.getData`                               |
| `bigquery.models.getMetadata`                           |
| `bigquery.models.list`                                  |
| `bigquery.tables.get`                                   |
| `bigquery.tables.getIamPolicy`                          |
| `bigquery.tables.list`                                  |
| `bigtable.appProfiles.list`                             |
| `bigtable.backups.list`                                 |
| `bigtable.clusters.list`                                |
| `bigtable.instances.list`                               |
| `bigtable.tables.list`                                  |
| `billing.budgets.list`                                  |
| `binaryauthorization.policy.get`                        |
| `cloudasset.assets.listCloudbillingBillingAccounts`     |
| `cloudasset.assets.listCloudbillingProjectBillingInfos` |
| `cloudasset.assets.searchAllIamPolicies`                |
| `cloudbuild.builds.get`                                 |
| `cloudbuild.builds.list`                                |
| `cloudbuild.integrations.get`                           |
| `cloudbuild.integrations.list`                          |
| `cloudbuild.repositories.get`                           |
| `cloudbuild.repositories.list`                          |
| `cloudbuild.workerpools.list`                           |
| `cloudfunctions.functions.list`                         |
| `cloudkms.cryptoKeys.getIamPolicy`                      |
| `cloudkms.cryptoKeys.list`                              |
| `cloudkms.keyRings.list`                                |
| `cloudsecurityscanner.scanruns.list`                    |
| `cloudsecurityscanner.scans.list`                       |
| `cloudsql.instances.list`                               |
| `compute.addresses.list`                                |
| `compute.backendBuckets.list`                           |
| `compute.backendServices.list`                          |
| `compute.disks.list`                                    |
| `compute.firewalls.list`                                |
| `compute.forwardingRules.list`                          |
| `compute.globalAddresses.list`                          |
| `compute.globalForwardingRules.list`                    |
| `compute.healthChecks.list`                             |
| `compute.images.get`                                    |
| `compute.images.getIamPolicy`                           |
| `compute.images.list`                                   |
| `compute.instanceGroups.list`                           |
| `compute.instances.list`                                |
| `compute.networks.list`                                 |
| `compute.projects.get`                                  |
| `compute.regionBackendServices.list`                    |
| `compute.regionHealthChecks.list`                       |
| `compute.regionTargetHttpProxies.list`                  |
| `compute.regionTargetHttpsProxies.list`                 |
| `compute.regionUrlMaps.list`                            |
| `compute.snapshots.list`                                |
| `compute.sslPolicies.list`                              |
| `compute.subnetworks.list`                              |
| `compute.targetHttpProxies.list`                        |
| `compute.targetHttpsProxies.list`                       |
| `compute.targetSslProxies.list`                         |
| `compute.urlMaps.list`                                  |
| `container.clusters.list`                               |
| `dataproc.clusters.list`                                |
| `dns.managedZones.list`                                 |
| `dns.policies.list`                                     |
| `iam.roles.list`                                        |
| `iam.serviceAccountKeys.list`                           |
| `iam.serviceAccounts.list`                              |
| `logging.logMetrics.list`                               |
| `logging.sinks.list`                                    |
| `memcache.instances.list`                               |
| `monitoring.alertPolicies.list`                         |
| `orgpolicy.policies.list`                               |
| `orgpolicy.policy.get`                                  |
| `osconfig.inventories.get`                              |
| `privateca.caPools.list`                                |
| `privateca.certificateAuthorities.getIamPolicy`         |
| `privateca.certificateAuthorities.list`                 |
| `privateca.certificates.list`                           |
| `pubsub.subscriptions.list`                             |
| `pubsub.topics.getIamPolicy`                            |
| `pubsub.topics.list`                                    |
| `redis.instances.list`                                  |
| `resourcemanager.folders.list`                          |
| `resourcemanager.organizations.get`                     |
| `resourcemanager.projects.get`                          |
| `resourcemanager.projects.getIamPolicy`                 |
| `resourcemanager.projects.list`                         |
| `run.configurations.list`                               |
| `run.routes.list`                                       |
| `run.services.list`                                     |
| `secretmanager.secrets.list`                            |
| `secretmanager.versions.list`                           |
| `serviceusage.services.list`                            |
| `source.repos.list`                                     |
| `spanner.databases.getIamPolicy`                        |
| `spanner.databases.list`                                |
| `spanner.instanceConfigs.list`                          |
| `spanner.instances.list`                                |
| `storage.buckets.getIamPolicy`                          |
| `storage.buckets.list`                                  |
<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_END} -->
