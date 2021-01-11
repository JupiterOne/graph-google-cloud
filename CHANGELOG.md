# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
