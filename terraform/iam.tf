resource "google_project_iam_custom_role" "ga_custom_role" {
  role_id     = "${var.project_id_number}customrole"
  title       = "GA custom role"
  description = "My description"
  permissions = [
    "cloudfunctions.functions.get",
    "cloudfunctions.functions.getIamPolicy"
  ]
}
