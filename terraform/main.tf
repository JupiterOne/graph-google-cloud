provider "google" {
  credentials = file(abspath(var.service_account_key_file_path))
  project = var.project_id
  region = var.region
}

data "google_project" "current" {}
