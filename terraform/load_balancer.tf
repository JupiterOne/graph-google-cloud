resource "google_compute_instance" "load_balancer_instance" {
  name         = "load-balancer-instance"
  machine_type = "f1-micro"
  tags         = ["http-tag"]
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-1804-lts"
    }
  }

  network_interface {
    network = "default"

    access_config {
    }
  }

  metadata_startup_script = "sudo apt-get update; sudo apt-get install -yq build-essential apache2"
}

resource "google_compute_health_check" "load-balancer-health-check" {
  name = "load-balancer-health-check"

  timeout_sec        = 1
  check_interval_sec = 1

  tcp_health_check {
    port = "80"
  }
}

resource "google_compute_instance_group" "www-resources" {
  name = "tf-www-resources"
  zone = "us-central1-a"

  instances = [google_compute_instance.load_balancer_instance.self_link]

  named_port {
    name = "http"
    port = "80"
  }
}

// Backend service example
resource "google_compute_backend_service" "load-balancer-www-service" {
  name     = "load-balancer-www-service"
  protocol = "HTTP"
  backend {
    group = google_compute_instance_group.www-resources.self_link
  }

  health_checks = [google_compute_health_check.load-balancer-health-check.self_link]
}

resource "google_compute_url_map" "load-balancer-url-map" {
  name            = "load-balancer-url-map"
  default_service = google_compute_backend_service.load-balancer-www-service.self_link

  host_rule {
    hosts        = ["*"]
    path_matcher = "tf-allpaths"
  }

  path_matcher {
    name            = "tf-allpaths"
    default_service = google_compute_backend_service.load-balancer-www-service.self_link
  }
}

resource "google_compute_target_http_proxy" "http-lb-proxy" {
  name    = "load-balancer-http-lb-proxy"
  url_map = google_compute_url_map.load-balancer-url-map.self_link
}

resource "google_compute_managed_ssl_certificate" "lb-default" {
  name = "load-balancer-test-cert"

  managed {
    domains = ["sslcert.tf-test.club."]
  }
}

resource "google_compute_target_https_proxy" "lb-default" {
  name             = "load-balancer-test-proxy"
  url_map          = google_compute_url_map.load-balancer-url-map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.lb-default.id]
}

// Region backend service example
resource "google_compute_region_backend_service" "region-backend-service-example" {
  load_balancing_scheme = "INTERNAL_MANAGED"

  backend {
    group          = google_compute_region_instance_group_manager.rigm.instance_group
    balancing_mode = "UTILIZATION"
    capacity_scaler = 1.0
  }

  region      = "us-central1"
  name        = "region-service"
  protocol    = "HTTP"
  timeout_sec = 10

  health_checks = [google_compute_region_health_check.region-health-check.id]
}

data "google_compute_image" "debian_image" {
  family   = "debian-9"
  project  = "debian-cloud"
}

resource "google_compute_region_instance_group_manager" "rigm" {
  region   = "us-central1"
  name     = "rbs-rigm"
  version {
    instance_template = google_compute_instance_template.instance_template.id
    name              = "primary"
  }
  base_instance_name = "internal-glb"
  target_size        = 1

  named_port {
    name = "http"
    port = "80"
  }
}

resource "google_compute_instance_template" "instance_template" {
  name         = "template-region-service"
  machine_type = "e2-medium"

  network_interface {
    network    = google_compute_network.region-network-example.id
    subnetwork = google_compute_subnetwork.region-subnetwork-example.id
  }

  disk {
    source_image = data.google_compute_image.debian_image.self_link
    auto_delete  = true
    boot         = true
  }

  tags = ["allow-ssh", "load-balanced-backend"]
}

resource "google_compute_region_health_check" "region-health-check" {
  region = "us-central1"
  name   = "region-health-check"
  http_health_check {
    port_specification = "USE_SERVING_PORT"
  }
}

resource "google_compute_network" "region-network-example" {
  name                    = "rbs-net"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

resource "google_compute_subnetwork" "region-subnetwork-example" {
  name          = "rbs-net-default"
  ip_cidr_range = "10.1.2.0/24"
  region        = "us-central1"
  network       = google_compute_network.region-network-example.id
}

# Region load balancer with region target http proxy example
resource "google_compute_region_target_http_proxy" "region-target-http-proxy" {
  region  = "us-central1"
  name    = "region-target-http-proxy"
  url_map = google_compute_region_url_map.region-load-balancer.id
}

resource "google_compute_region_url_map" "region-load-balancer" {
  region          = "us-central1"
  name            = "region-load-balancer"
  default_service = google_compute_region_backend_service.region-backend-service-a.id

  host_rule {
    hosts        = ["mysite.com"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_region_backend_service.region-backend-service-a.id

    path_rule {
      paths   = ["/*"]
      service = google_compute_region_backend_service.region-backend-service-a.id
    }
  }
}

resource "google_compute_region_backend_service" "region-backend-service-a" {
  region                = "us-central1"
  name                  = "region-backend-service-a"
  protocol              = "HTTP"
  timeout_sec           = 10
  load_balancing_scheme = "INTERNAL_MANAGED"

  health_checks = [google_compute_region_health_check.region-health-check-a.id]
}

resource "google_compute_region_health_check" "region-health-check-a" {
  region = "us-central1"
  name   = "region-health-check-a"
  http_health_check {
    port = 80
  }
}