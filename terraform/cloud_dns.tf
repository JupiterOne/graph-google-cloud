resource "random_id" "rnd" {
  byte_length = 4
}

resource "google_dns_managed_zone" "example-zone" {
  name        = "example-public-zone"
  dns_name    = "example-${random_id.rnd.hex}.com."
  description = "Example DNS zone"
}

resource "google_dns_policy" "example-policy" {
  count = var.enable_google_dns_policy_example ? 1 : 0
  name                      = "example-policy"
  enable_inbound_forwarding = true

  enable_logging = true

  alternative_name_server_config {
    target_name_servers {
      ipv4_address    = "172.16.1.10"
      forwarding_path = "private"
    }
    target_name_servers {
      ipv4_address = "172.16.1.20"
    }
  }

  networks {
    network_url = google_compute_network.network-1.id
  }
  networks {
    network_url = google_compute_network.network-2.id
  }
}

resource "google_compute_network" "network-1" {
  count = var.enable_google_dns_policy_example ? 1 : 0
  name                    = "network-1"
  auto_create_subnetworks = false
}

resource "google_compute_network" "network-2" {
  count = var.enable_google_dns_policy_example ? 1 : 0
  name                    = "network-2"
  auto_create_subnetworks = false
}
