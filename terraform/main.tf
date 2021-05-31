terraform {
  required_version = "~> 0.15.4"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 3.69.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.1.0"
    }
  }
}

provider "google" {
  credentials = var.service_account_key
  project = var.project_id
  region = var.region
}

data "google_project" "current" {}
