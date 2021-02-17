terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 3.57.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.0.1"
    }
  }
}

provider "google" {
  credentials = file(abspath(var.service_account_key_file_path))
  project = var.project_id
  region = var.region
}

data "google_project" "current" {}
