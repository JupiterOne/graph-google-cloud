resource "google_bigquery_dataset" "dataset" {
  dataset_id                  = "test_big_query_dataset"
  description                 = "This is a test description"
  location                    = "US"

  access {
    role          = "OWNER"
    user_by_email = var.client_email
  }
}