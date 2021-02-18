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

resource "google_storage_bucket" "sink-log-bucket" {
  name = "${var.project_id}-sink-logging-bucket"
}
