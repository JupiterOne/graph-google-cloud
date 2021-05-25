resource "google_bigquery_dataset" "dataset" {
  dataset_id                  = "test_big_query_dataset"
  description                 = "This is a test description"
  location                    = "US"

  access {
    role          = "OWNER"
    user_by_email = var.client_email
  }
}

// CMEK example
resource "google_bigquery_dataset" "cmek_example_dataset" {
  dataset_id                  = "cmed_example_dataset"
  friendly_name               = "cmed_example_dataset"
  description                 = "This is a test description"
  location                    = "US"
  default_table_expiration_ms = 3600000

  default_encryption_configuration {
    kms_key_name = google_kms_crypto_key.cmek_bigquery_crypto_key.id
  }
}

resource "google_kms_crypto_key" "cmek_bigquery_crypto_key" {
  name     = "cmek_bigquery_crypto_key"
  key_ring = google_kms_key_ring.cmek_bigquery_key_ring.id
}

resource "google_kms_key_ring" "cmek_bigquery_key_ring" {
  name     = "example-keyring"
  location = "us"
}
