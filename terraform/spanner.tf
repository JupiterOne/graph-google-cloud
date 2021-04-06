resource "google_spanner_instance" "example_spanner_instance" {
  count        = var.enable_spanner_example ? 1 : 0
  config       = "regional-us-central1"
  name         = "example-spanner-instance"
  display_name = "Example Spanner Instance"
  num_nodes    = 2
  labels = {
    "foo" = "bar"
  }
}

resource "google_spanner_instance_iam_binding" "spanner_instance_binding" {
  count    = var.enable_spanner_example ? 1 : 0
  instance = google_spanner_instance.example_spanner_instance[0].name
  role     = "roles/spanner.databaseReader"

  members = [
    "serviceAccount:${var.client_email}"
  ]
}

resource "google_spanner_database" "example_spanner_database" {
  count    = var.enable_spanner_example ? 1 : 0
  instance = google_spanner_instance.example_spanner_instance[0].name
  name     = "example-database"
  ddl = [
    "CREATE TABLE t1 (t1 INT64 NOT NULL,) PRIMARY KEY(t1)",
    "CREATE TABLE t2 (t2 INT64 NOT NULL,) PRIMARY KEY(t2)",
  ]
  deletion_protection = false
}

resource "google_spanner_database_iam_binding" "spanner_database_binding" {
  count    = var.enable_spanner_example ? 1 : 0
  instance = google_spanner_instance.example_spanner_instance[0].name
  database = google_spanner_database.example_spanner_database[0].name
  role     = "roles/spanner.databaseReader"

  members = [
    "serviceAccount:${var.client_email}"
  ]
}
