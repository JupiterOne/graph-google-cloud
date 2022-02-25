resource "google_organization_iam_audit_config" "all-services-config" {
  org_id = "${var.project_id}"
  service = "allServices"
  audit_log_config {
    log_type = "DATA_READ"
  }
}

resource "google_organization_iam_audit_config" "exempted-members-config" {
  org_id = "${var.project_id}"
  service = "dataproc.googleapis.com"
  audit_log_config {
    log_type = "DATA_WRITE"
    exempted_members = [
      "serviceAccount:${var.client_email}",
    ]
  }
}