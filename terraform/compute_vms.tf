resource "google_compute_instance" "testvm_not_accesible_internet" {
  count = var.enable_compute_vm_no_internet ? 1 : 0

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

################################################################################
# Start Terraform for publicly accessible compute VM
################################################################################

locals {
  public_compute_app_name = "public-compute-app"
}

# Allow http
resource "google_compute_firewall" "allow_http" {
  name    = "${local.public_compute_app_name}-fw-allow-http"
  network = google_compute_network.public_compute_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  target_tags = ["http"]
}

# Allow https
resource "google_compute_firewall" "allow_https" {
  name    = "${local.public_compute_app_name}-fw-allow-https"
  network = google_compute_network.public_compute_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  target_tags = ["https"]
}

# Explicit SSH Deny
resource "google_compute_firewall" "deny_ssh" {
  name    = "${local.public_compute_app_name}-fw-deny-ssh"
  network = google_compute_network.public_compute_vpc.name

  deny {
    protocol = "tcp"
    ports    = ["22"]
  }

  target_tags = ["ssh"]
}

# Create VPC
resource "google_compute_network" "public_compute_vpc" {
  name                    = "${local.public_compute_app_name}-vpc"
  auto_create_subnetworks = "false"
  routing_mode            = "GLOBAL"
}

# Create public subnet
resource "google_compute_subnetwork" "public_subnet_1" {
  name          = "${local.public_compute_app_name}-public-subnet-1"
  ip_cidr_range = "10.10.1.0/24"
  network       = google_compute_network.public_compute_vpc.name
}

resource "google_compute_instance" "vm_instance_public" {
  count = var.enable_compute_vm_internet ? 1 : 0

  name         = "${local.public_compute_app_name}-vm"
  machine_type = "f1-micro"
  zone         = "us-central1-a"
  tags         = ["http"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-1804-lts"
    }
  }

  metadata_startup_script = "sudo apt-get update; sudo apt-get install -yq build-essential apache2"

  network_interface {
    network       = google_compute_network.public_compute_vpc.name
    subnetwork    = google_compute_subnetwork.public_subnet_1.name
    access_config { }
  }
}
################################################################################
# End Terraform for publicly accessible compute VM
################################################################################
