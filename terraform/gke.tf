resource "google_service_account" "gke_default_service_account" {
  count = var.enable_gke_cluster ? 1 : 0

  account_id   = "j1-gc-integration-dev-gke-sa"
  display_name = "JupiterOne Integration Development GKE Service Account"
}

resource "google_container_cluster" "primary" {
  count = var.enable_gke_cluster ? 1 : 0

  name     = "j1-gc-integration-dev-gke-cluster"
  location = "us-central1"

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1
}

################################################################################
# BEGIN google_container_cluster.primary disabled resources
#
# The following Terraform resources reference the above google_container_cluster.primary,
# which is not enabled. If the google_container_cluster.primary is re-enabled,
# you can uncomment the below lines as well
################################################################################

# resource "google_container_node_pool" "primary_preemptible_nodes" {
#   name       = "j1-gc-integration-dev-gke-node-pool"
#   location   = "us-central1"
#   cluster    = google_container_cluster.primary.name
#   node_count = 1

#   node_config {
#     preemptible  = true
#     machine_type = "e2-micro"

#     # Google recommends custom service accounts that have cloud-platform scope
#     # and permissions granted via IAM Roles.
#     service_account = google_service_account.gke_default_service_account.email
#     oauth_scopes    = [
#       "https://www.googleapis.com/auth/cloud-platform"
#     ]
#   }
# }

# resource "google_binary_authorization_policy" "policy" {
#   count = var.enable_gke_cluster ? 1 : 0

#   admission_whitelist_patterns {
#     name_pattern = "gcr.io/google_containers/*"
#   }

#   default_admission_rule {
#     evaluation_mode  = "ALWAYS_ALLOW"
#     enforcement_mode = "ENFORCED_BLOCK_AND_AUDIT_LOG"
#   }

#   cluster_admission_rules {
#     cluster                 = "${google_container_cluster.primary.location}.${google_container_cluster.primary.name}"
#     evaluation_mode         = "REQUIRE_ATTESTATION"
#     enforcement_mode        = "ENFORCED_BLOCK_AND_AUDIT_LOG"
#     require_attestations_by = [google_binary_authorization_attestor.attestor.name]
#   }
# }

################################################################################
# END google_container_cluster.primary disabled resources
################################################################################

resource "google_container_analysis_note" "note" {
  name = "test-attestor-note"
  attestation_authority {
    hint {
      human_readable_name = "My attestor"
    }
  }
}

resource "google_binary_authorization_attestor" "attestor" {
  name = "test-attestor"
  attestation_authority_note {
    note_reference = google_container_analysis_note.note.name
  }
}
