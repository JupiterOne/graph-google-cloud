# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Support for ingesting the following **new** entities

  - BigQuery
    - `google_bigquery_table`

- Support for ingesting the following **new** relationships

  - BigQuery
    - `google_bigquery_dataset` **HAS** `google_bigquery_table`
    - `google_bigquery_dataset` **USES** `google_kms_crypto_key`

- - Support for `--integration-polling-interval` in the
    `jupiterone-organization-setup` CLI

### Changed

- Add `Database` class to `google_bigquery_dataset`

## 0.28.0 - 2021-05-21

### Added

- [#175](https://github.com/JupiterOne/graph-google-cloud/issues/175) - Add
  `projectId` property to _all_ entities

### Changed

- Upgraded integration SDK packages to v6.2.0

## 0.27.0 - 2021-05-20

### Added

- New properties added to resources:

  - `google_compute_disk`
    - `kmsKeyServiceAccount`
    - `kmsKeyName`
  - `google_sql_mysql_instance`
    - `kmsKeyName`
  - `google_sql_postgres_instance`
    - `kmsKeyName`
  - `google_sql_sql_server_instance`
    - `kmsKeyName`
  - `google_storage_bucket`
    - `kmsKeyName`

- New relationships

  - Compute

    - `google_compute_disk` **USES** `google_kms_crypto_key`

  - SQL Admin
    - `google_sql_mysql_instance` **USES** `google_kms_crypto_key`
    - `google_sql_postgres_instance` **USES** `google_kms_crypto_key`
    - `google_sql_sql_server_instance` **USES** `google_kms_crypto_key`

### Fixed

- [#171](https://github.com/JupiterOne/graph-google-cloud/issues/171) - Do not
  fail when App Engine applications and versions cannot be fetched

## 0.26.0 - 2021-05-19

### Added

- New properties added to resources:

  - `google_compute_instance`
    - `integrityMonitoringEnabled`
    - `secureBootEnabled`
    - `vtpmEnabled`
    - `connectedNetworksCount`

### Changed

- Upgrade all packages

### Fixed

- Improved logic that determines whether a `google_compute_instance` is a
  shielded VM or not by considering whether vTPM is enabled

- [#151](https://github.com/JupiterOne/graph-google-cloud/issues/151) - Fix
  duplicate `_key` on Cloud Run resources

- [#158](https://github.com/JupiterOne/graph-google-cloud/issues/158) - Do not
  fail when App Engine services cannot be fetched

## 0.25.1 - 2021-05-17

### Fixed

- [#152](https://github.com/JupiterOne/graph-google-cloud/issues/152) - Publish
  job log message when `compute.images.get` permission is missing

- [#153](https://github.com/JupiterOne/graph-google-cloud/issues/153) - Handle
  disks that do not have an image assigned (blank disks)

## 0.25.0 - 2021-05-12

### Added

- New properties added to resources:

  - `google_compute_instance`
    - `webLink`
  - `google_compute_disk`
    - `webLink`

- [#140](https://github.com/JupiterOne/graph-google-cloud/issues/140) - Map more
  IAM permissions to service APIs, which will generate additional
  `google_cloud_api_service` **HAS** `google_iam_role` relationships

- Add permissions property to managed `google_iam_role` entities

## 0.24.0 - 2021-05-11

### Added

- Support for ingesting the following **new** resources

  - Compute
    - `google_compute_image`

- Support for ingesting the following **new** relationships

  - IAM
    - `google_group` **ASSIGNED** `google_iam_role`
  - API Service
    - `google_cloud_api_service` **HAS** `google_iam_role`

- New properties added to resources:
  - `google_cloud_api_service`
    - `hasIamPermissions`
  - `google_iam_role`
    - `readonly`

### Changes

- `google_user` is now created as a target entity through a mapped relationship

## 0.23.1 - 2021-05-03

### Fixed

- Fixes [#126](https://github.com/JupiterOne/graph-google-cloud/issues/126)
  Buckets should still be ingested if the bucket policy cannot be fetched

## 0.23.0 - 2021-04-28

### Changed

- New properties added to resources:
  - `google_compute_instance`
    - `hostname` - Fixes
      [#111](https://github.com/JupiterOne/graph-google-cloud/issues/111)

## 0.22.4 - 2021-04-28

### Fixed

- Fixes [#116](https://github.com/JupiterOne/graph-google-cloud/issues/116)
  Publish integration job log event when fetching alert monitoring policies
  fails due to `project/{PROJECT_ID} is not a workspace`

## 0.22.3 - 2021-04-26

### Fixed

- Fixes [#119](https://github.com/JupiterOne/graph-google-cloud/issues/119)
  Throw error when policy could not be fetched

## 0.22.2 - 2021-04-26

### Changed

- Raise `project/{PROJECT_ID} is not a workspace` error message when attempting
  to fetch alert monitoring policies

### Fixed

- Fixed [#107](https://github.com/JupiterOne/graph-google-cloud/issues/107) -
  Publish unprocessed buckets message to integration job log when a bucket is
  configured with "requestor pays"

## 0.22.1 - 2021-04-22

### Changed

- Upgrade integration SDK packages
- Upgraded `googleapis` package

### Fixed

- Fix `memoryUsage` and `diskUsageBytes` App Engine properties having `NaN`
  values

## 0.22.0 - 2021-04-14

### Added

- Support for ingesting the following **new** resources

  - Certificate Authority
    - `google_privateca_certificate_authority`
    - `google_privateca_certificate`

### Changed

- Upgraded `googleapis` package

## 0.21.1 - 2021-04-12

### Fixed

- Remove ingestion of raw data from `google_compute_instance` as it can contain
  a significant amount of data

## 0.21.0 - 2021-04-08

### Added

- Support for ingesting the following **new** resources

- New relationships

  - Cloud Functions
    - `google_cloud_function` **USES** `google_iam_service_account`

## 0.20.0 - 2021-04-07

### Added

- Support for ingesting the following **new** resources

  - API Gateway

    - `google_api_gateway_api`
    - `google_api_gateway_api_config`
    - `google_api_gateway_gateway`

  - Spanner

    - `google_spanner_instance`
    - `google_spanner_instance_database`
    - `google_spanner_instance_config`

### Changed

- Upgraded all packages

## 0.19.0 - 2021-03-24

- Support for ingesting the following **new** resources

  - Redis
    - `google_redis_instance`
  - Memcache
    - `google_memcache_instance`
    - `google_memcache_instance_node`

## 0.18.0 - 2021-03-24

### Added

- Support for ingesting the following **new** resources

  - Pub/Sub

    - `google_pubsub_topic`
    - `google_pubsub_subscription`

  - App Engine Admin

    - `google_app_engine_application`
    - `google_app_engine_service`
    - `google_app_engine_version`
    - `google_app_engine_instance`

  - Cloud Run
    - `google_cloud_run_service`
    - `google_cloud_run_configuration`
    - `google_cloud_run_route`

### Changed

- Upgraded all packages

## 0.17.0 - 2021-03-17

### Added

- Add a `tag.` property to every entity for each label in the Google Cloud
  `labels` property. For example, if a `google_storage_bucket` has a `labels`
  property that has the value:

```json
{
  "myLabel": "myLabelVal",
  "myOtherLabel": "myOtherLabelValue"
}
```

The following individual tags will be copied onto the entity: `tag.myLabel`,
`tag.myOtherLabel`

## 0.16.0 - 2021-03-17

### Added

- Support for ingesting the following **new** resources
  - Entities
    - `google_compute_instance_group_named_port`
  - Relationships
    - Compute
      - `google_compute_instance_group` **HAS**
        `google_compute_instance_group_named_port`
- New properties added to resources:
  - `google_compute_instance_group`
    - `webLink`

## 0.15.0 - 2021-03-04

### Added

- Support for ingesting the following **new** resources

- New relationships

  - GKE
    - `google_container_node_pool` **HAS** `google_compute_instance_group`

- New properties added to resources:
  - GKE
    - `google_container_node_pool`
      - `serviceAccount`
      - `bootDiskKmsKey`
  - `google_container_cluster`
    - `workloadIdentity`

### Changed

- Update integration SDK packages

### Fixed

- SDK package upgrades contained bug fixes for `jobState.getData` typings. Fixed
  usage in this project.

## 0.14.0 - 2021-02-23

### Added

- Support for ingesting the following **new** resources
  - GKE
    - `google_container_node_pool`
    - `google_binary_authorization_policy`

## 0.13.0 - 2021-02-17

### Added

- Support for `--skip-project-id-regex` in the `jupiterone-organization-setup`
  CLI

- Support for ingesting the following **new** resources

  - Logging
    - `google_logging_metric`
    - `google_logging_project_sink`
    - `google_monitoring_alert_policy`
  - Networking
    - `google_compute_health_check`
    - `google_compute_instance_group`
    - `google_compute_url_map`
    - `google_compute_backend_service`
    - `google_compute_backend_bucket`
    - `google_compute_target_ssl_proxy`
    - `google_compute_target_https_proxy`
    - `google_compute_target_http_proxy`
    - `google_compute_ssl_policy`
  - GKE (Google Kubernetes Engine):
    - `google_container_cluster`

- New properties added to various existing resources:
  - Storage
    - `google_storage_bucket`
      - `retentionPolicyEnabled`
      - `retentionPeriod`
      - `retentionDate`
  - `google_kms_crypto_key`
    - `public`

### Fixed

- Log integration job event from the `fetch-compute-project` step when the
  service account used to execute the integration does not have the
  `compute.projects.get` permission.

## 0.12.0 - 2021-02-05

### Added

- Support for ingesting the following **new** resources

  - Cloud SQL
    - `google_cloud_sql_mysql_instance`
    - `google_cloud_sql_postgres_instance`
    - `google_cloud_sql_sql_server_instance`
  - BigQuery
    - `google_cloud_big_query_dataset`
  - Compute
    - `google_compute_project`
  - DNS
    - `google_dns_managed_zone`

- New properties added to various existing resources for CIS benchmarks:

  - Compute
    - `google_compute_disk`
      - `isCustomerSuppliedKeysEncrypted`
    - `google_compute_instance`
      - `usesDefaultServiceAccount`
      - `usesFullAccessDefaultServiceAccount`
      - `blockProjectSSHKeys`
      - `isSerialPortEnabled`
      - `isShieldedVM`
      - `publicIpAddress`
      - `privateIpAddress`
      - `isOSLoginEnabled`
  - Networking
    - `google_compute_subnetwork`
      - `flowLogsEnabled`
    - `google_compute_network`
      - `IPv4Range`
  - KMS
    - `google_kms_crypto_key`
      - `public`

- Support for `--rotate-service-account-keys` in the
  `jupiterone-organization-setup` CLI

### Fixed

- Retry concurrent policy modification error in `jupiterone-organization-setup`
  CLI
- Various fixes to make `jupiterone-organization-setup` more idempotent

## 0.11.1 - 2021-01-05

### Added

- Error handling for all api calls
- Billing configuration errors will be shown in the job log

### Changed

- Upgrade integration SDK `devDependencies`

## 0.11.0 - 2020-12-17

- Upgrade all project `dependencies` and `devDependencies`

## 0.10.0 - 2020-12-11

### Changed

- Improve job log messaging when `/v1/projects/{projectId}` request responds
  with 403:FORBIDDEN. Previously, the job log simply stated "The caller does not
  have permission".

### Added

- Add `roles/iam.roleViewer` as a required role in developer documentation. This
  role includes the `resourcemanager.projects.get` permission, which is required
  to access the `/v1/projects/{projectId}` endpoint.
- Improve JupiterOne Google Cloud organization script to walk all folders in an
  organization.

Example usage:

```
yarn jupiterone-organization-setup \
  --google-access-token $(gcloud auth print-access-token) \
  --organization-id 1111111111 \
  --jupiterone-account-id MY_JUPITERONE_ACCOUNT_ID_HERE \
  --jupiterone-api-key MY_JUPITERONE_API_KEY_HERE
```

## 0.9.0 - 2020-11-05

### Added

- Create script that allows JupiterOne integration instance creation for every
  Google Cloud project in an organization

### Fixed

- Fixed IAM service account `ASSIGNED` role relationship duplicates

## 0.8.0 - 2020-10-29

### Changed

- Upgrade SDK v4

## 0.7.1 - 2020-10-22

### Fixed

- Always create an `Account` entity, even if API to `/projects/<projectId>`
  fails

## 0.7.0 - 2020-10-20

### Added

- [#36](https://github.com/JupiterOne/graph-google-cloud/pull/36) Ingestion of
  new project resource
  - `google_cloud_project`
- New relationship
  - `google_cloud_project` **HAS** `google_cloud_api_service`

## 0.6.0 - 2020-10-08

### Added

- Expose boolean `public` property on `google_storage_bucket` that determines
  whether a storage bucket is public

Example JupiterOne query:

```
find google_storage_bucket with public=true
```

## 0.5.0 - 2020-10-05

### Added

- [#30](https://github.com/JupiterOne/graph-google-cloud/pull/30) Ingestion of
  new networking resources
  - `google_compute_firewall`
  - `google_compute_network`
  - `google_compute_subnetwork`
- [#31](https://github.com/JupiterOne/graph-google-cloud/pull/31) Ingestion of
  new KMS resources
  - `google_kms_key_ring`
  - `google_kms_crypto_key`
- New relationships
  - `google_compute_firewall` **PROTECTS** `google_compute_network`
  - `google_compute_network` **CONTAINS** `google_compute_subnetwork`
  - `google_compute_network` **HAS** `google_compute_firewall`
  - `google_compute_subnetwork` **HAS** `google_compute_instance`
  - `Internet` **ALLOWS** `google_compute_firewall`
  - `Internet` **DENIES** `google_compute_firewall`
  - `Host` **ALLOWS** `google_compute_firewall`
  - `Host` **DENIES** `google_compute_firewall`
  - `Network` **ALLOWS** `google_compute_firewall`
  - `Network` **DENIES** `google_compute_firewall`
  - `google_kms_key_ring` **HAS** `google_kms_crypto_key`

## 0.4.2 - 2020-10-02

### Fixed

- Duplicate `_key` detected error happened when the Google Cloud
  `serviceusage.services.list` API returned a duplicate API service
  intermittently.

## 0.4.1 - 2020-09-28

### Fixed

- Fixed `ComputeInstanceTrustsServiceAccount` relationship which allowed array
  relationships.

## 0.4.0 - 2020-09-28

### Added

- Build relationship between `google_compute_instance` and
  `google_iam_service_account`

### Updated

- Update to
  [SDK v3.0.0](https://github.com/JupiterOne/sdk/blob/master/packages/integration-sdk/CHANGELOG.md#300---2020-08-24)

### Fixed

- Fixed potential for DUPLICATE_KEY_ERROR in `fetchResourceManagerIamPolicy`

## 0.3.0 - 2020-08-20

### Added

- Ingest Google Compute disks as `google_compute_disk`
- Ingest Google Compute instances as `google_compute_instance`
- Create `google_compute_instance` `USES` `google_compute_disk` relationship
- Upgrade JupiterOne SDK packages

## 0.2.0 - 2020-08-11

### Added

- Ingest IAM roles as `google_iam_role`
- Ingest IAM service accounts as `google_iam_service_account`
- Ingest IAM service account keys as `google_iam_service_account_key` and build
  `HAS` relationship between `google_iam_service_account` and
  `google_iam_service_account_key`.
- Ingest `google_user`
- Build `ASSIGNED` relationship between `google_user` and `google_iam_role`
- Fixes #10 - Build `ASSIGNED` relationship between `google_iam_service_account`
  and `google_iam_role`

### Updated

- Fixes #11 - Update all existing entity keys to not include the `_type` prefix
- Fixes #31 - Make `_type` naming convention consistent with G Suite integration
  for `google_user` and the rest with Google Cloud Terraform provider.

## 0.1.0 - 2020-08-04

### Added

- Generate `.env` file using the `create-env-file` script

Example:

```bash
yarn create-env-file ~/SERVICE_ACCOUNT_FILE_PATH_HERE.json
```

### Updated

- Update Google Cloud integration config to store entire service account key
  file contents instead of subset of properties

## 0.0.1 - 2020-08-03

### Added

- Initial `@jupiterone/graph-google-cloud` release.
- Ingestion of `google_cloud_function`
- Ingestion of `google_storage_bucket`
- Ingestion of `google_cloud_api_service`
- Integration setup documentation
