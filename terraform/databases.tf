# When database is deleted, the name cannot be reused for a week, this random ID
# Allows us to always be able to create databases when we run the terraform
resource "random_id" "db_name_suffix" {
  byte_length = 8
}

resource "google_sql_database_instance" "postgres_instance" {
  count = var.enable_postgres_instance ? 1 : 0

  name             = "sql-postgres-${random_id.db_name_suffix.hex}"
  database_version = "POSTGRES_12"
  region           = "us-central1"
  deletion_protection = false

  settings {
    tier = "db-f1-micro"
  }
}

resource "google_sql_database_instance" "mysql_instance" {
  count = var.enable_mysql_instance ? 1 : 0

  name             = "sql-mysql-${random_id.db_name_suffix.hex}"
  database_version = "MYSQL_5_7"
  region           = "us-central1"
  deletion_protection = false

  settings {
    tier = "db-f1-micro"
  }
}
