
resource "google_compute_disk" "example_disk" {
  name  = "example-disk"
  type  = "pd-ssd"
  zone  = "us-central1-a"
  image = "debian-9-stretch-v20200805"
  labels = {
    environment = "dev"
  }
  physical_block_size_bytes = 4096
}

################################################################################
# Start: Encrypted disk
################################################################################
resource "google_kms_key_ring" "encrypted_disk_bucket_key_ring" {
  name = "${var.project_id}-disk-bucket-ring"
  location = "us"
}

resource "google_kms_crypto_key" "encrypted_disk_bucket_key" {
  name = "${var.project_id}-disk-bucket-key"
  key_ring = google_kms_key_ring.encrypted_disk_bucket_key_ring.self_link
  rotation_period = "86401s"
  depends_on = [google_kms_key_ring.encrypted_disk_bucket_key_ring]
}

resource "google_kms_crypto_key_iam_binding" "service_account_encrypted_disk_role_binding" {
  crypto_key_id = google_kms_crypto_key.encrypted_disk_bucket_key.self_link
  role = "roles/cloudkms.cryptoKeyEncrypterDecrypter"

  members = [
    "serviceAccount:service-${var.project_id_number}@compute-system.iam.gserviceaccount.com",
  ]
}

resource "google_compute_disk" "example_encrypted_disk" {
  name  = "example-encrypted-disk"
  type  = "pd-ssd"
  zone  = "us-central1-a"
  image = "debian-9-stretch-v20200805"

  labels = {
    environment = "dev"
  }

  disk_encryption_key {
    kms_key_self_link = google_kms_crypto_key.encrypted_disk_bucket_key.self_link
  }

  physical_block_size_bytes = 4096
}
################################################################################
# End: Encrypted disk
################################################################################

resource "google_compute_snapshot" "example_snapshot" {
  name        = "example-snapshot"
  source_disk = google_compute_disk.example_disk.name
  zone        = "us-central1-a"
  labels = {
    my_label = "value"
  }
  storage_locations = ["us-central1"]
}

resource "google_compute_image" "example_snapshot_image" {
  name = "example-snapshot-image"
  source_snapshot = google_compute_snapshot.example_snapshot.name
}

resource "google_compute_image" "example_disk_image" {
  name = "example-disk-image"

  # raw_disk {
  #   source = google_compute_disk.example_disk.name
  #   zone = google_compute_disk.example_disk.zone
  # }
  source_disk = google_compute_disk.example_disk.self_link
  # source-disk-zone = google_compute_disk.example_disk.zone
}

data "google_compute_image" "debian" {
  family  = "debian-9"
  project = "debian-cloud"
}

resource "google_compute_image" "example_source_image" {
  name = "example-source-image"
  source_image = data.google_compute_image.debian.self_link
}

resource "google_compute_instance" "testvm_snapshot" {
  count = var.enable_testvm_not_accesible_internet_custom_image_snapshot ? 1 : 0

  name         = "testvmusingsnapshot"
  machine_type = "n1-standard-1"
  zone         = "us-central1-a"
  tags = ["testvmtag1", "testvmtag2"]

  boot_disk {
    initialize_params {
      image = google_compute_image.example_snapshot_image.self_link
    }
  }

  # boot_disk {
  #   initialize_params {
  #     image = "ubuntu-os-cloud/ubuntu-1804-lts"
  #   }
  # }

  // Local SSD disk
  scratch_disk {
    interface = "SCSI"
  }

  network_interface {
    network = "default"
  }

  metadata = {
    foo = "bar"
  }

  metadata_startup_script = "echo Hello"

  service_account {
    email = var.client_email
    scopes = ["userinfo-email", "compute-ro", "storage-ro"]
  }
}

// Region disk
resource "google_compute_region_disk" "region_disk" {
  name                      = "my-region-disk"
  snapshot                  = google_compute_snapshot.snapdisk.id
  type                      = "pd-ssd"
  region                    = "us-central1"
  physical_block_size_bytes = 4096

  replica_zones = ["us-central1-a", "us-central1-f"]
}

resource "google_compute_disk" "disk" {
  name  = "my-disk"
  image = "debian-cloud/debian-9"
  size  = 50
  type  = "pd-ssd"
  zone  = "us-central1-a"
}

resource "google_compute_snapshot" "snapdisk" {
  name        = "my-snapshot"
  source_disk = google_compute_disk.disk.name
  zone        = "us-central1-a"
}
