# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Ingest IAM roles as `google_cloud_iam_role`
- Ingest IAM service accounts as `google_cloud_iam_service_account`
- Ingest IAM service account keys as `google_cloud_iam_service_account_key` and
  build `HAS` relationship between `google_cloud_iam_service_account` and
  `google_cloud_iam_service_account_key`.
- Ingest `google_cloud_user`
- Build `IMPLEMENTS` relationship between `google_cloud_iam_user` and
  `google_cloud_iam_role`
- Build `IMPLEMENTS` relationship between `google_cloud_iam_service_account` and
  `google_cloud_iam_role`

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
- Ingestion of `google_cloud_storage_bucket`
- Ingestion of `google_cloud_api_service`
- Integration setup documentation
