# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
