// A isolated compute address
resource "google_compute_address" "test_ip_address" {
  name = "my-test-address"
}

// Forwarding rule for external network load balancing using backend services
resource "google_compute_forwarding_rule" "forwarding_rule_example" {
  count                 = var.enable_forwarding_rule_external_example ? 1 : 0
  name                  = "forwarding-rule-example"
  region                = "us-central1"
  port_range            = 80
  backend_service       = google_compute_region_backend_service.forwarding_rule_example_backend[count.index].id
}

resource "google_compute_region_backend_service" "forwarding_rule_example_backend" {
  count                 = var.enable_forwarding_rule_external_example ? 1 : 0
  name                  = "forwarding-rule-example-backend"
  region                = "us-central1"
  load_balancing_scheme = "EXTERNAL"
  health_checks         = [google_compute_region_health_check.forwarding_rule_example_hc[count.index].id]
}

resource "google_compute_region_health_check" "forwarding_rule_example_hc" {
  count              = var.enable_forwarding_rule_external_example ? 1 : 0
  name               = "forwarding-rule-example-hc"
  check_interval_sec = 1
  timeout_sec        = 1
  region             = "us-central1"

  tcp_health_check {
    port = "80"
  }
}

// Forwarding rule for internal load balancing
resource "google_compute_address" "forwarding_rule_example_address" {
  count        = var.enable_forwarding_rule_internal_example ? 1 : 0
  name         = "forwarding-rule-example-address"
  subnetwork   = google_compute_subnetwork.forwarding_rule_example_subnetwork_internal[count.index].id
  address_type = "INTERNAL"
  address      = "10.0.42.42"
  region       = "us-central1"
}

resource "google_compute_forwarding_rule" "forwarding_rule_example_internal" {
  count                 = var.enable_forwarding_rule_internal_example ? 1 : 0
  name                  = "forwarding-rule-example-internal"
  region                = "us-central1"
  load_balancing_scheme = "INTERNAL"
  backend_service       = google_compute_region_backend_service.forwarding_rule_example_backend_internal[count.index].id
  all_ports             = true
  allow_global_access   = true
  ip_address            = google_compute_address.forwarding_rule_example_address[count.index].id
  network               = google_compute_network.forwarding_rule_example_network_internal[count.index].name
  subnetwork            = google_compute_subnetwork.forwarding_rule_example_subnetwork_internal[count.index].name
}

resource "google_compute_region_backend_service" "forwarding_rule_example_backend_internal" {
  count                 = var.enable_forwarding_rule_internal_example ? 1 : 0
  name                  = "forwarding-rule-example-backend-internal"
  region                = "us-central1"
  health_checks         = [google_compute_health_check.forwarding_rule_example_hc_internal[count.index].id]
}

resource "google_compute_health_check" "forwarding_rule_example_hc_internal" {
  count              = var.enable_forwarding_rule_internal_example ? 1 : 0
  name               = "forwarding-rule-example-hc-internal"
  check_interval_sec = 1
  timeout_sec        = 1
  tcp_health_check {
    port = "80"
  }
}

resource "google_compute_network" "forwarding_rule_example_network_internal" {
  count                   = var.enable_forwarding_rule_internal_example ? 1 : 0
  name                    = "forwarding-rule-example-network-internal"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "forwarding_rule_example_subnetwork_internal" {
  count         = var.enable_forwarding_rule_internal_example ? 1 : 0
  name          = "forwarding-rule-example-subnetwork-internal"
  ip_cidr_range = "10.0.0.0/16"
  region        = "us-central1"
  network       = google_compute_network.forwarding_rule_example_network_internal[count.index].id
}

// Global forwarding rule example
resource "google_compute_global_forwarding_rule" "global_forwarding_rule_example" {
  count      = var.enable_global_forwarding_rule_example ? 1 : 0
  name       = "global-forwarding-rule-example"
  target     = google_compute_target_http_proxy.global_forwarding_rule_example_http_proxy[count.index].id
  port_range = "80"
}

resource "google_compute_target_http_proxy" "global_forwarding_rule_example_http_proxy" {
  count       = var.enable_global_forwarding_rule_example ? 1 : 0
  name        = "global-forwarding-rule-example-http-proxy"
  description = "a description"
  url_map     = google_compute_url_map.global_forwarding_rule_example_load_balancer[count.index].id
}

resource "google_compute_url_map" "global_forwarding_rule_example_load_balancer" {
  count           = var.enable_global_forwarding_rule_example ? 1 : 0
  name            = "global-forwarding-rule-example-load-balancer"
  description     = "a description"
  default_service = google_compute_backend_service.load-balancer-www-service[count.index].id

  host_rule {
    hosts        = ["mysite.com"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.load-balancer-www-service.id

    path_rule {
      paths   = ["/*"]
      service = google_compute_backend_service.load-balancer-www-service.id
    }
  }
}

# Global address
resource "google_compute_global_address" "global_address_example" {
  count         = var.enable_global_address_with_network_example ? 1 : 0
  name          = "global-address-example"
  address_type  = "INTERNAL"
  purpose       = "PRIVATE_SERVICE_CONNECT"
  network       = google_compute_network.global_address_example_network[count.index].id
  address       = "100.100.100.105"
}

resource "google_compute_network" "global_address_example_network" {
  count                   = var.enable_global_address_with_network_example ? 1 : 0
  name                    = "global-address-example-network"
  auto_create_subnetworks = false
}
