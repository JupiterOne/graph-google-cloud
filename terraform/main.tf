terraform {
  required_version = "~> 0.14"

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
  credentials = var.service_account_key
  project = var.project_id
  region = var.region
}

data "google_project" "current" {}
