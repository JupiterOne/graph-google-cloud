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
