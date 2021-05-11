
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
