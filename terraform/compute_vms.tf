resource "google_compute_instance" "testvm_not_accesible_internet" {
  name         = "testvm"
  machine_type = "n1-standard-1"
  zone         = "us-central1-a"

  tags = ["testvmtag1", "testvmtag2"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-9"
    }
  }

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
