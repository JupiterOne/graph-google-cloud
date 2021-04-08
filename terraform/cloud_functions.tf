resource "google_storage_bucket" "cloud_functions_bucket" {
  name = "${var.project_id}cloudfunctions"
}

data "archive_file" "http_trigger" {
  type = "zip"
  output_path = "${path.module}/data/http_trigger.zip"
  source {
    content = file("${path.module}/data/http_trigger.js")
    filename = "index.js"
  }
}

resource "google_storage_bucket_object" "cloud_functions_archive_bucket" {
  name = "http_trigger.zip"
  bucket = google_storage_bucket.cloud_functions_bucket.name
  source = "${path.module}/data/http_trigger.zip"
  depends_on = [data.archive_file.http_trigger]
}

resource "google_cloudfunctions_function" "test_function" {
  name = "${var.project_id}testfunction"
  description = "Test function"
  runtime = "nodejs10"

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.cloud_functions_bucket.name
  source_archive_object = google_storage_bucket_object.cloud_functions_archive_bucket.name
  trigger_http = true
  timeout = 60
  entry_point = "handler"

  environment_variables = {
    TEST_ENV_VAR = "test-env-var-val"
  }
}

resource "google_service_account" "test_function_service_account" {
  account_id   = "j1-gc-integration-dev-f-sa"
  display_name = "Service account for a test Google Cloud Function"
}

resource "google_cloudfunctions_function" "test_function_with_service_account" {
  name = "${var.project_id}testfunctionwithsa"
  description = "Test function with service account"
  runtime = "nodejs10"

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.cloud_functions_bucket.name
  source_archive_object = google_storage_bucket_object.cloud_functions_archive_bucket.name
  trigger_http = true
  timeout = 60
  entry_point = "handler"
  service_account_email = google_service_account.test_function_service_account.email

  environment_variables = {
    TEST_ENV_VAR = "test-env-var-val"
  }
}
