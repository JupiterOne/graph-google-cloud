# Integration with JupiterOne

## Setup

## Data Model

### Entities

Provide a table that maps concepts from the provider to the `_type` and `_class`
generated.

| Resources            | \_type of the Entity               | \_class of the Entity |
| -------------------- | ---------------------------------- | --------------------- |
| Cloud Function       | `google_cloud_function`            | `Function`            |
| Cloud Storage Bucket | `google_cloud_storage_bucket`      | `DataStore`           |
| Cloud API Service    | `google_cloud_api_service`         | `Service`             |
| IAM Role             | `google_cloud_iam_role`            | `AccessRole`          |
| IAM Service Account  | `google_cloud_iam_service_account` | `User`                |

### Relationships

The following relationships are created/mapped:

| From | Edge | To  |
| ---- | ---- | --- |

