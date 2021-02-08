resource "google_service_account" "gke_default_service_account" {
  account_id   = "j1-gc-integration-dev-gke-sa"
  display_name = "JupiterOne Integration Development GKE Service Account"
}

resource "google_container_cluster" "primary" {
  name     = "j1-gc-integration-dev-gke-cluster"
  location = "us-central1"

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "primary_preemptible_nodes" {
  name       = "j1-gc-integration-dev-gke-node-pool"
  location   = "us-central1"
  cluster    = google_container_cluster.primary.name
  node_count = 1

  node_config {
    preemptible  = true
    machine_type = "e2-micro"

    # Google recommends custom service accounts that have cloud-platform scope
    # and permissions granted via IAM Roles.
    service_account = google_service_account.gke_default_service_account.email
    oauth_scopes    = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
