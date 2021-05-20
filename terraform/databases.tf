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

resource "google_kms_key_ring" "encrypted_sql_instance_key_ring" {
  name = "${var.project_id}-encrypted-sql-instance-ring"
  location = "us-central1"
}

resource "google_kms_crypto_key" "encrypted_sql_instance_key" {
  name = "${var.project_id}-encrypted-sql-instance-key"
  key_ring = google_kms_key_ring.encrypted_sql_instance_key_ring.self_link
  rotation_period = "86401s"
  depends_on = [google_kms_key_ring.encrypted_sql_instance_key_ring]
}

resource "google_kms_crypto_key_iam_binding" "service_account_encrypted_sql_instance_role_binding" {
  crypto_key_id = google_kms_crypto_key.encrypted_sql_instance_key.self_link
  role = "roles/cloudkms.cryptoKeyEncrypterDecrypter"

  members = [
    "serviceAccount:service-${var.project_id_number}@gcp-sa-cloud-sql.iam.gserviceaccount.com",
  ]
}

# ***************
# NOTE: The following is commented out because it is only currently supported in
#       the GCP Terraform provider beta version. Leaving here for reference later.
# ***************

# ################################################################################
# # Begin: Encrypted SQL database instance
# ################################################################################
# resource "random_id" "encrypted_db_name_suffix" {
#   byte_length = 8
# }

# resource "google_sql_database_instance" "encrypted_postgres_instance" {
#   # count = var.enable_encrypted_postgres_instance ? 1 : 0

#   name             = "sql-postgres-${random_id.encrypted_db_name_suffix.hex}"
#   database_version = "POSTGRES_12"
#   region           = "us-central1"
#   deletion_protection = false

#   encryption_key_name = google_kms_crypto_key.encrypted_sql_instance_key.self_link

#   settings {
#     tier = "db-f1-micro"
#   }
# }
# ################################################################################
# # End: Encrypted SQL database instance
# ################################################################################
