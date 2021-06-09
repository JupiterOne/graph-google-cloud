resource "google_project_iam_custom_role" "ga_custom_role" {
  role_id     = "${var.project_id_number}customrole"
  title       = "GA custom role"
  description = "My description"
  permissions = [
    "cloudfunctions.functions.get",
    "cloudfunctions.functions.getIamPolicy"
  ]
}

# resource "google_project_iam_custom_role" "extended_role" {
#   role_id     = "${var.project_id_number}extendedrole"
#   title       = "Security Reviewer Extender Role"
#   description = "A role that adds necessary permissions for the integration that aren't granted via Security Reviewer role"
#   permissions = [
#     "compute.projects.get",
#     "resourcemanager.projects.get",
#     "binaryauthorization.policy.get",
#     "appengine.applications.get",
#   ]
# }

resource "google_project_iam_custom_role" "ga_custom_role_conditions" {
  role_id     = "${var.project_id_number}customroleconditions"
  title       = "GA custom role conditions"
  description = "My description"
  permissions = [
    "cloudfunctions.functions.list",
    "cloudfunctions.functions.create"
  ]
}

resource "google_project_iam_binding" "ga_custom_role_binding" {
  role = google_project_iam_custom_role.ga_custom_role.id
  members = [
    "serviceAccount:${var.client_email}"
  ]
}

# resource "google_project_iam_binding" "extender_role_binding" {
#   role = google_project_iam_custom_role.extended_role.id
#   members = [
#     "serviceAccount:${var.integration_runner_service_account_client_email}"
#   ]
# }

resource "google_project_iam_binding" "ga_custom_role_binding_conditions" {
  role = google_project_iam_custom_role.ga_custom_role_conditions.id

  members = [
    "serviceAccount:${var.client_email}"
  ]

  condition {
    title       = "Test condition title"
    description = "Test condition description"
    expression  = "resource.name != \"bogusunknownresourcename\""
  }
}

// Needed for being able to read BigQuery datasets
# resource "google_project_iam_binding" "bigquery_data_viewer_binding" {
#   role    = "roles/bigquery.dataViewer"

#   members = [
#     "serviceAccount:${var.integration_runner_service_account_client_email}",
#   ]
# }

# Needed for being able to create PubSub topics which use customer managed keys
resource "google_project_iam_binding" "pubsub_sa_kms_encrypter_binding" {
  role    = "roles/cloudkms.cryptoKeyEncrypter"

  members = [
    # PubSub service account (hidden from service accounts list)
    "serviceAccount:service-${var.project_id_number}@gcp-sa-pubsub.iam.gserviceaccount.com",
  ]
}

# Needed for being able to create PubSub topics which use customer managed keys
resource "google_project_iam_binding" "pubsub_sa_kms_decrypter_binding" {
  role    = "roles/cloudkms.cryptoKeyDecrypter"

  members = [
    # PubSub service account (hidden from service accounts list)
    "serviceAccount:service-${var.project_id_number}@gcp-sa-pubsub.iam.gserviceaccount.com",
  ]
}
