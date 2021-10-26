# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Breaking:** The `permissions` property on `google_iam_binding`s and
  `google_iam_role`s will now be structured:

  ```
  permissions: [
    'storage.read',
    'storage.write'
    'storage.objects.read',
    'storage.objects.delete',
    ...
  ],
  ```

  instead of:

  ```
  permissions: 'storage.read,storage.write,storage.objects.read,storage.objects.delete,...'
  ```

  This was needed in order to avoid the 4096 characters property truncation
  limit imposed in v1.1.0. To maintain functionality, querys for permissions
  will need to change from:

  `Find google_iam_role with permissions~='storage.objects.admin'`

  to

  `Find google_iam_role with permissions='storage.objects.admin'`

### Added

- A test to ensure `GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP` and
  `J1_TYPE_TO_KEY_GENERATOR_MAP` are kept up-to-date with new entitiy ingestion.

## 1.2.1 - 2021-10-25

### Fixed

- Only run `organizationSteps` if you are the Master Integration Instance for an
  organization. These steps will no longer be run on instances that were
  automatically generated via the "Configure Organization Projects"
  configuration variable.

## 1.2.0 - 2021-10-22

### Fixed

- The logic for determining if an integration instance is ingesting only a
  single non-auto-generated Google Cloud project was corrected. This means that
  auto-configured integraiton instances will not run Cloud Asset steps and Cloud
  Billing steps. Only the Master Integration Instance will run those steps.

## 1.1.2 - 2021-10-22

### Changed

- Document every relationship type individually in the step metadata for
  `google_iam_binding_allows_ANY_RESOURCE` and
  `google_cloud_api_service_has_ANY_RESOURCE` relationships

## 1.1.1 - 2021-10-22

### Added

- The config variable `markBindingStepsAsPartial` that allows for disabling
  binding steps.

## 1.1.0 - 2021-10-22

### Changed

- The `permissions` property on `google_iam_binding`s and `google_iam_role`s
  will now be truncated to 4096 characters. This means that queries for
  `permissions` on these entities might return false negitive results for large
  permission sets.

## 1.0.8 - 2021-10-21

### Changed

- Do not index relationships created in the `cloud-asset` steps to prevent out
  of memory errors.

## 1.0.7 - 2021-10-21

### Added

- Added support for ingesting the following **new** resources:

  | Service      | Resource / Entity           |
  | ------------ | --------------------------- |
  | Audit Config | `google_cloud_audit_config` |

- Added support for ingesting the following **new** relationships:

  | Source                     | class    | Target                      |
  | -------------------------- | -------- | --------------------------- |
  | `google_cloud_api_service` | **USES** | `google_cloud_audit_config` |

- API calls will now have a `timeout` of one minute.
- Organization setup will now have an api `timeout` of five minutes when
  updating the organization IAM policy.

### Fixed

- TypeError from when `CREATE_IAM_ENTITY_MAP` did not contain an entity creation
  function.
- TypeError from when there is no condition in `fetch-logging-metrics`

## 1.0.6 - 2021-10-15

### Removed

- `rawData` on Basic `google_iam_role`s and `google_iam_bindings` to prevent
  upload errors.

## 1.0.5 - 2021-10-14

### Fixed

- Only store the first 500 members in the rawData for `google_iam_binding`s to
  prevent upload error.
- Only store the first 500 permissions in the rawData for `google_iam_role`s to
  prevent upload error.
- Only store the first 500 characters of the role description in the rawData for
  `google_iam_role`s to prevent upload error.
- Prevent `DUPLICATE_KEY_ERROR`s in steps
  `create-binding-principal-relationships` and
  `create-binding-any-resource-relationships`.

## 1.0.4 - 2021-10-14

### Fixed

- Prevent an error in `getTablePolicy` from causing `fetch-big-query-tables` to
  error out.

## 1.0.3 - 2021-10-11

### Fixed

- Managed questions that used `Find google_user ASSIGNED google_iam_role`
  traversals to use
  `Find google_user that ASSIGNED google_iam_binding that USES google_iam_role`
  instead.

## 1.0.1 - 2021-10-08

### Fixed

- Basic `google_iam_roles` will now properly set the `permissions` property.

## 1.0.0 - 2021-10-08

### Removed

- **Breaking** Relationships between `google_iam_role`s and principal members.
  These traversals will now need to go through the `google_iam_binding` first.
  Ex: `Find google_user ASSIGNED google_iam_role` will need to change to be
  `Find google_user that ASSIGNED google_iam_binding that USES google_iam_role`.
  This is done because in Google Cloud IAM, a principal is not directly assigned
  a role, they are only assigned a role for a specific reasource via an IAM
  Binding.

| Source                             | class        | Target            |
| ---------------------------------- | ------------ | ----------------- |
| `google_user`                      | **ASSIGNED** | `google_iam_role` |
| `google_group`                     | **ASSIGNED** | `google_iam_role` |
| `google_domain`                    | **ASSIGNED** | `google_iam_role` |
| `everyone`                         | **ASSIGNED** | `google_iam_role` |
| `google_cloud_authenticated_users` | **ASSIGNED** | `google_iam_role` |
| `google_iam_service_account`       | **ASSIGNED** | `google_iam_role` |

- **Breaking** Step `fetch-resource-manager-iam-policy` was removed. IAM Policy
  analysis for projects will now be done in the `fetch-iam-bindings` step, which
  requires the Cloud Asset API to be enabled. In order to continue having the
  project level IAM Policy analyzed, ensure your gcloud account has
  `cloudasset.googleapis.com` enabled (instructions
  [here](https://github.com/JupiterOne/graph-google-cloud/blob/main/docs/jupiterone.md#in-google-cloud))

### Changed

- `google_iam_binding`'s `_key` property will now contain the `condition`
  property of the binding in order to ensure all conditions are properly
  captured in binding entities.
- New `google_iam_role`s for `google_cloud_project`s, `google_cloud_folder`s,
  and `google_cloud_organization`s will get created for each Google Cloud Basic
  Role (`roles/editor`, `roles/owner`, ...) that is attached via a role binding,
  instead of having a single `google_iam_role` that all relate to.
- Step `fetch-iam-bindings` will fetch IAM Policies using the project scope when
  triggered by an integration without an `organizationId` in its
  integrationConfig.

### Added

- Create relationships for every member of `google_iam_binding`s.
- Added support for ingesting the following **new** relationships:

| Source                             | class      | Target                             |
| ---------------------------------- | ---------- | ---------------------------------- |
| `google_iam_binding`               | `ASSIGNED` | `google_cloud_authenticated_users` |
| `google_iam_binding`               | `ASSIGNED` | `everyone`                         |
| `google_iam_binding`               | `ASSIGNED` | `google_iam_role`                  |
| `everyone`                         | `ASSIGNED` | `google_iam_role`                  |
| `google_cloud_authenticated_users` | `ASSIGNED` | `google_iam_role`                  |
| `google_cloud_api_service`         | `HAS`      | `ANY_RESOURCE`                     |

- New properties added to resources:

  | Entity                 | Properties     |
  | ---------------------- | -------------- |
  | `google_iam_binding`   | `permissions`  |
  | `google_iam_binding`   | `organization` |
  | `google_iam_binding`   | `folders`      |
  | `google_cloud_folder`  | `parent`       |
  | (mapped) `google_user` | `emailDomain`  |

- Custom `google_iam_roles` will be ingested from the Organization level as well
  as the Project level.

### Fixed

- Mapped relationships were not getting between `google_iam_bindings` and
  principals.

## 0.51.5 - 2021-10-01

### Fixed

- Removed unnecessary "UNABLE_TO_FIND_PROJECT_ID" error.

## 0.51.4 - 2021-09-27

### Added

- Initial managed JupiterOne questions moved into this project

### Fixed

- `Internet` **ALLOWS** `google_compute_firewall` relationship for
  `0.0.0.0/0`/`::/0` source CIDR blocks restored by adding `_type` to the target
  filter keys.

## 0.50.0 - 2021-09-15

### Added

- New properties added to resources:

  | Entity                           | Properties    |
  | -------------------------------- | ------------- |
  | `google_bigquery_table`          | `kmsKeyName`  |
  | `google_sql_sql_server_instance` | `userOptions` |

## 0.49.0 - 2021-09-14

### Added

- Added support for ingesting the following **new** resources:

  | Service        | Resource / Entity                                                                                                                       |
  | -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
  | Dataproc       | `google_dataproc_cluster`                                                                                                               |
  | Cloud Billing  | `google_billing_account`                                                                                                                |
  | N/A            | `google_billing_budget`                                                                                                                 |
  | Cloud Bigtable | `google_bigtable_app_profile`, `google_bigtable_backup`, `google_bigtable_cluster`, `google_bigtable_instance`, `google_bigtable_table` |

- Added support for ingesting the following **new** relationships:

  | Source                     | class  | Target                        |
  | -------------------------- | ------ | ----------------------------- |
  | `google_dataproc_cluster`  | `USES` | `google_kms_crypto_key`       |
  | `google_dataproc_cluster`  | `USES` | `google_compute_image`        |
  | `google_dataproc_cluster`  | `USES` | `google_storage_bucket`       |
  | `google_billing_account`   | `HAS`  | `google_billing_budget`       |
  | `google_cloud_project`     | `USES` | `google_billing_budget`       |
  | `google_bigtable_cluster`  | `HAS`  | `google_bigtable_backup`      |
  | `google_bigtable_cluster`  | `USES` | `google_kms_crypto_key`       |
  | `google_bigtable_instance` | `HAS`  | `google_bigtable_app_profile` |
  | `google_bigtable_instance` | `HAS`  | `google_bigtable_cluster`     |
  | `google_bigtable_instance` | `HAS`  | `google_bigtable_table`       |
  | `google_bigtable_table`    | `HAS`  | `google_bigtable_backup`      |

- Added support for ingesting the following **new** relationships:

  | Source                           | class  | Target                  |
  | -------------------------------- | ------ | ----------------------- |
  | `google_bigquery_dataset`        | `USES` | `google_kms_crypto_key` |
  | `google_compute_disk`            | `USES` | `google_kms_crypto_key` |
  | `google_compute_image`           | `USES` | `google_kms_crypto_key` |
  | `google_pubsub_topic`            | `USES` | `google_kms_crypto_key` |
  | `google_spanner_database`        | `USES` | `google_kms_crypto_key` |
  | `google_sql_mysql_instance`      | `USES` | `google_kms_crypto_key` |
  | `google_sql_postgres_instance`   | `USES` | `google_kms_crypto_key` |
  | `google_sql_sql_server_instance` | `USES` | `google_kms_crypto_key` |

- New properties added to resources:

  | Entity                           | Properties               |
  | -------------------------------- | ------------------------ |
  | `google_sql_postgres_instance`   | `logMinMessages`         |
  | `google_sql_sql_server_instance` | `externalScriptsEnabled` |
  | `google_sql_sql_server_instance` | `userConnections`        |
  | `google_sql_sql_server_instance` | `remoteAccess`           |
  | `google_sql_sql_server_instance` | `traceFlag`              |

## 0.48.0 - 2021-08-27

### Changed

- Added support for ingesting the following **new** resources:

  | Service    | Resource / Entity   |
  | ---------- | ------------------- |
  | DNS Policy | `google_dns_policy` |

- Added support for ingesting the following **new** relationships:

  | Source                   | class   | Target              |
  | ------------------------ | ------- | ------------------- |
  | `google_compute_network` | **HAS** | `google_dns_policy` |

- Relationships from `google_cloud_organization`s and `google_cloud_folder`s to
  `google_cloud_project`s will also be made for deleted projects as well.
- the following **mapped** relationships to skip target creation:

  | Source               | class        | Target                       |
  | -------------------- | ------------ | ---------------------------- |
  | `google_iam_binding` | **ALLOWS**   | `ANY_RESOURCE`               |
  | `google_iam_binding` | **ASSIGNED** | `google_group`               |
  | `google_iam_binding` | **ASSIGNED** | `google_iam_service_account` |
  | `google_iam_binding` | **ASSIGNED** | `google_user`                |
  | `google_iam_binding` | **ASSIGNED** | `google_domain`              |
  | `google_user`        | **CREATED**  | `google_app_engine_version`  |

- Separate the step to build `google_bigquery_dataset_uses_kms_crypto_key`
  relationship
- Modified `google_bigquery_dataset` step to be independent from
  `google_kms_crypto_key` step

## 0.48.0 - 2021-08-27

### Added

- New properties added to resources:

  | Entity                  | Properties              |
  | ----------------------- | ----------------------- |
  | `google_storage_bucket` | `isSubjectToObjectAcls` |
  | `google_iam_binding`    | `readonly`              |

### Changed

- The property `public` on `google_storage_bucket` to be `true` when the storage
  bucket does not have Uniform Bucket Access Level enabled. We can not determine
  if the bucket is public or not when this setting is not enabled.

## 0.47.5

### Fixed

- Managed `google_iam_roles` now have a `permissions` property, similar to
  custom `google_iam_roles`.

- Allow BigQuery data to be ingested independently of KMS key data

### Changed

- Changed `google_iam_bindings.permissions: string[]` to
  `google_iam_bindings.permissions: string` due to limitations on `string[]`
  property lengths in JupiterOne. Queries will need to be changed from
  `permissions={{string}}` to `permissions~={{string}}` to maintain
  functionality

- Add logging around Google Cloud configuration and step enablement

## 0.47.4

- Add 429 status code to existing retry logic

## 0.47.0 - 2021-08-02

- Added support for ingesting the following **new** relationships:

  | Source               | class        | Target                           |
  | -------------------- | ------------ | -------------------------------- |
  | `google_iam_binding` | **ALLOWS**   | `google_cloud_projects`          |
  | `google_iam_binding` | **ALLOWS**   | `google_sql_mysql_instance`      |
  | `google_iam_binding` | **ALLOWS**   | `google_sql_postgres_instance`   |
  | `google_iam_binding` | **ALLOWS**   | `google_sql_sql_server_instance` |
  | `google_iam_binding` | **ASSIGNED** | `google_domain`                  |

## Fixed

- `google_iam_binding` **ALLOWS** `ANY_RESOURCE` relationships to work for all
  ingested resources

## 0.46.1 - 2021-07-28

### Fixed

- Retry API calls on "Quota exceeded" errors

## 0.46.0 - 2021-07-28

### Changed

- Upgraded integration SDK packages to v6.13.0

### Fixed

- Encode path part of `webLink` entity property

## 0.45.0 - 2021-07-20

### Added

- Added support for ingesting the following **new** relationships:

  | Source               | class      | Target         |
  | -------------------- | ---------- | -------------- |
  | `google_iam_binding` | **ALLOWS** | `ANY_RESOURCE` |

## 0.44.2 - 2021-07-20

### Fixed

- Step that fetches App Engine Applications should not fail when
  `appengine.apps.get` responds with a `404`

## 0.44.1 - 2021-07-20

### Fixed

- Step that fetches resource manager project should not fail when project cannot
  be fetched

## 0.44.0 - 2021-07-19

### Added

- Added support for ingesting the following **new** relationships:

  | Source               | class        | Target                       |
  | -------------------- | ------------ | ---------------------------- |
  | `google_iam_binding` | **ASSIGNED** | `google_group`               |
  | `google_iam_binding` | **ASSIGNED** | `google_iam_service_account` |
  | `google_iam_binding` | **ASSIGNED** | `google_user`                |
  | `google_iam_binding` | **USES**     | `google_iam_role`            |

## 0.43.3 - 2021-07-15

### Fixed

- Handle case when global `google_compute_image` has been removed from Google
  Cloud and results in a 404 status code when attempting to fetch

## 0.43.2 - 2021-06-24

### Fixed

- [#255](https://github.com/JupiterOne/graph-google-cloud/issues/255) - Ensure
  that `google_redis_instance` and `google_memcache_instance` use unique `_key`
  values

## 0.43.1 - 2021-06-23

### Fixed

- [#243](https://github.com/JupiterOne/graph-google-cloud/issues/243) - Always
  assign boolean value to `public` property on `google_storage_bucket`

## 0.43.0 - 2021-06-22

### Changed

- Refactor multiple steps to build relationships in a separate step

### Added

- New properties added to resources:

  | Entity                    | Properties             |
  | ------------------------- | ---------------------- |
  | `google_compute_instance` | `serviceAccountEmails` |

## 0.42.0 - 2021-06-22

### Added

- New properties added to resources:

  | Entity                  | Properties            |
  | ----------------------- | --------------------- |
  | `google_cloud_function` | `serviceAccountEmail` |

### Fixed

- [#248](https://github.com/JupiterOne/graph-google-cloud/issues/248) - Always
  execute steps in org child projects even if child project has service disabled

## 0.41.0 - 2021-06-21

### Added

- Added support for ingesting the following **new** relationships:

  | Source                   | \_class    | Target                   |
  | ------------------------ | ---------- | ------------------------ |
  | `google_compute_network` | `CONNECTS` | `google_compute_network` |

## 0.40.0 - 2021-06-21

### Changed

- Log step start states

## 0.38.3 - 2021-06-10

### Fixed

- [#239](https://github.com/JupiterOne/graph-google-cloud/issues/239) -
  `google_iam_role` should assign the actual target project `projectId` instead
  of the org project

## 0.38.2 - 2021-06-09

### Fixed

- [#237](https://github.com/JupiterOne/graph-google-cloud/issues/237) - Prevent
  duplicate `google_iam_binding` `_key` values

## 0.38.0 - 2021-06-09

### Fixed

- Improve job log event to print whether organization project configuration is
  enabled

## 0.37.1 - 2021-06-08

### Fixed

- Disable organization steps using both `configurationOrganizationProjects`
  config value and whether the service API is enabled

## 0.37.0 - 2021-06-08

### Added

- Added support for ingesting the following **new** resources:

  | Service                | Resource / Entity                                                                                                                                                                                                                                                                                                                                                                                                     |
  | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Access Context Manager | `google_access_context_manager_access_policy`, `google_access_context_manager_access_level`, `google_access_context_manager_service_perimeter`, `google_access_context_manager_service_perimeter_egress_policy`, `google_access_context_manager_service_perimeter_ingress_policy`, `google_access_context_manager_service_perimeter_api_operation`, `google_access_context_manager_service_perimeter_method_selector` |

- Added support for ingesting the following **new** relationships:

  | Source                                                           | \_class    | Target                                                            |
  | ---------------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
  | `google_access_context_manager_access_policy`                    | `HAS`      | `google_access_context_manager_access_level`                      |
  | `google_access_context_manager_access_policy`                    | `HAS`      | `google_access_context_manager_service_perimeter`                 |
  | `google_access_context_manager_service_perimeter`                | `HAS`      | `google_access_context_manager_service_perimeter_egress_policy`   |
  | `google_access_context_manager_service_perimeter`                | `HAS`      | `google_access_context_manager_service_perimeter_ingress_policy`  |
  | `google_access_context_manager_service_perimeter_egress_policy`  | `HAS`      | `google_access_context_manager_service_perimeter_api_operation`   |
  | `google_access_context_manager_service_perimeter_ingress_policy` | `HAS`      | `google_access_context_manager_service_perimeter_api_operation`   |
  | `google_access_context_manager_service_perimeter_api_operation`  | `HAS`      | `google_access_context_manager_service_perimeter_method_selector` |
  | `google_access_context_manager_service_perimeter`                | `PROTECTS` | `google_cloud_project`                                            |
  | `google_access_context_manager_service_perimeter`                | `PROTECTS` | `google_cloud_api_service`                                        |

## 0.36.2 - 2021-06-08

### Fixed

- Only run `fetch-iam-bindings` step when `configureOrganizationProjects` is
  enabled

## 0.36.1 - 2021-06-08

### Changed

- Additional error logging

## 0.36.0 - 2021-06-08

### Fixed

- Publish job log event that prints the service account email in use

## 0.35.1 - 2021-06-07

### Fixed

- Publish message when missing `cloudasset.assets.searchAllIamPolicies`
  permission

## 0.35.0 - 2021-06-07

### Added

- Added support for ingesting the following **new** resources:

  | Service     | Resource / Entity    |
  | ----------- | -------------------- |
  | IAM Binding | `google_iam_binding` |

## 0.34.2 - 2021-06-06

### Changed

- Use the actual `google_cloud_organization` `displayName` property for the
  display name instead of the organization `name` property

### Fixed

- Do not upload `_rawData` for mapped relationship target entities

## 0.34.1 - 2021-06-06

### Fixed

- Rename `configureOrganizationAccounts` integration config property to
  `configureOrganizationProjects`

## 0.34.0 - 2021-06-06

### Added

- Added support for ingesting the following **new** resources:

  | Service  | Resource / Entity       |
  | -------- | ----------------------- |
  | BigQuery | `google_bigquery_model` |

- Added support for ingesting the following **new** relationships:

  | Source                    | \_class | Target                  |
  | ------------------------- | ------- | ----------------------- |
  | `google_bigquery_dataset` | `HAS`   | `google_bigquery_model` |

- New properties added to resources:

  | Entity                                   | Properties                   |
  | ---------------------------------------- | ---------------------------- |
  | `google_cloud_project`                   | `id`, `projectId`, `webLink` |
  | `google_api_gateway_api`                 | `function`                   |
  | `google_app_engine_version`              | `function`                   |
  | `google_cloud_run_service`               | `function`                   |
  | `google_compute_health_check`            | `function`                   |
  | `google_compute_backend_service`         | `function`                   |
  | `google_privateca_certificate_authority` | `function`                   |
  | `google_pubsub_subscription`             | `function`                   |
  | `google_cloud_api_service`               | `function`                   |

## 0.33.0 - 2021-06-04

### Added

- Added support for ingesting the following **new** resources:

  | Service                | Resource / Entity     |
  | ---------------------- | --------------------- |
  | Cloud Resource Manager | `google_cloud_folder` |

- Added support for ingesting the following **new** relationships:

  | Source                      | \_class | Target                 |
  | --------------------------- | ------- | ---------------------- |
  | `google_cloud_organization` | `HAS`   | `google_cloud_folder`  |
  | `google_cloud_folder`       | `HAS`   | `google_cloud_folder`  |
  | `google_cloud_organization` | `HAS`   | `google_cloud_project` |
  | `google_cloud_folder`       | `HAS`   | `google_cloud_project` |

## 0.32.1 - 2021-06-04

### Fixed

- [#208](https://github.com/JupiterOne/graph-google-cloud/issues/208) -
  Incorrect `projectId` property being applied to entities when `projectId` is
  supplied in integration config

## 0.32.0 - 2021-06-04

### Added

- Support for ingesting the following **new** entities

  - Google Cloud
    - `google_cloud_organization`

### Fixed

- [#171](https://github.com/JupiterOne/graph-google-cloud/issues/171) - Suppress
  errors when App Engine application is not found

## 0.31.0 - 2021-06-01

### Added

- Proper step enablement support when both a "main" and "target" Google Cloud
  projects are supplied

## 0.30.0 - 2021-05-29

### Added

- Additional integration config fields `configureOrganizationProjects`,
  `organizationId`, and `projectId`

### Changed

- Exported `IntegrationConfig`, `deserializeIntegrationConfig` and `Client` from
  the package

- Upgraded packages

## 0.29.0 - 2021-05-27

### Added

- Support for ingesting the following **new** entities

  - BigQuery
    - `google_bigquery_table`

- Support for ingesting the following **new** relationships

  - BigQuery
    - `google_bigquery_dataset` **HAS** `google_bigquery_table`
    - `google_bigquery_dataset` **USES** `google_kms_crypto_key`

- Support for `--integration-polling-interval` in the
  `jupiterone-organization-setup` CLI

### Changed

- Add `Database` class to `google_bigquery_dataset`

- [#186](https://github.com/JupiterOne/graph-google-cloud/issues/186) - Accept
  `storage-api.googleapis.com` and `storage-component.googleapis.com` services
  to enable buckets step

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
