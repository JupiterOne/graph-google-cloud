resource "google_project_iam_custom_role" "ga_custom_role" {
  role_id     = "${var.project_id_number}customrole"
  title       = "GA custom role"
  description = "My description"
  permissions = [
    "cloudfunctions.functions.get",
    "cloudfunctions.functions.getIamPolicy"
  ]
}

resource "google_project_iam_custom_role" "extended_role" {
  role_id     = "${var.project_id_number}extendedrole"
  title       = "Security Reviewer Extender Role"
  description = "A role that adds necessary permissions for the integration that aren't granted via Security Reviewer role"
  permissions = [
    "compute.projects.get",
    "resourcemanager.projects.get",
    "binaryauthorization.policy.get"
  ]
}

resource "google_project_iam_custom_role" "ga_custom_role_conditions" {
  role_id     = "${var.project_id_number}customroleconditions"
  title       = "GA custom role conditions"
  description = "My description"
  permissions = [
    "cloudfunctions.functions.list"
  ]
}

resource "google_project_iam_binding" "ga_custom_role_binding" {
  role = google_project_iam_custom_role.ga_custom_role.id
  members = [
    "serviceAccount:${var.client_email}"
  ]
}

resource "google_project_iam_binding" "extender_role_binding" {
  role = google_project_iam_custom_role.extended_role.id
  members = [
    "serviceAccount:${var.integration_runner_service_account_client_email}"
  ]
}

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
