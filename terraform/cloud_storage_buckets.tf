resource "google_kms_key_ring" "bucket_key_ring" {
  name = "${var.project_id}-bucket-ring"
  location = "us"
}

resource "google_kms_crypto_key" "bucket_key" {
  name = "${var.project_id}-bucket-key"
  key_ring = google_kms_key_ring.bucket_key_ring.self_link
  rotation_period = "86401s"
  depends_on = [google_kms_key_ring.bucket_key_ring]
}

resource "google_project_iam_member" "grant_google_storage_service_encrypt_decrypt" {
  role = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member = "serviceAccount:service-${var.project_id_number}@gs-project-accounts.iam.gserviceaccount.com"
}

resource "google_storage_bucket" "with_customer_encryption_key" {
  name = "customer-managed-encryption-key-bucket-${data.google_project.current.number}"

  encryption {
    default_kms_key_name = google_kms_crypto_key.bucket_key.self_link
  }

  depends_on = [google_project_iam_member.grant_google_storage_service_encrypt_decrypt]
}
