resource "google_spanner_instance" "example_spanner_instance" {
  config       = "regional-us-central1"
  name         = "example-spanner-instance"
  display_name = "Example Spanner Instance"
  num_nodes    = 2
  labels = {
    "foo" = "bar"
  }
}

resource "google_spanner_instance_iam_binding" "spanner_instance_binding" {
  instance = google_spanner_instance.example_spanner_instance.name
  role     = "roles/spanner.databaseReader"

  members = [
    "serviceAccount:${var.client_email}"
  ]
}

resource "google_spanner_database" "example_spanner_database" {
  instance = google_spanner_instance.example_spanner_instance.name
  name     = "example-database"
  ddl = [
    "CREATE TABLE t1 (t1 INT64 NOT NULL,) PRIMARY KEY(t1)",
    "CREATE TABLE t2 (t2 INT64 NOT NULL,) PRIMARY KEY(t2)",
  ]
  deletion_protection = false
}

resource "google_spanner_database_iam_binding" "spanner_database_binding" {
  instance = google_spanner_instance.example_spanner_instance.name
  database = google_spanner_database.example_spanner_database.name
  role     = "roles/spanner.databaseReader"

  members = [
    "serviceAccount:${var.client_email}"
  ]
}
