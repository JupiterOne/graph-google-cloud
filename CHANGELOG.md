# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
