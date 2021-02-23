variable "service_account_key" {
  type    = string
  default = ""
}

variable "developer_id" {
  type    = string
  default = ""
}

variable "project_id" {
  type = string
  default = ""
}

variable "project_id_number" {
  type = string
  default = ""
}

variable "client_email" {
  type = string
  default = ""
}

variable "region" {
  type = string
  default = "us-central1"
}

variable "integration_runner_service_account_client_email" {
  type    = string
  default = ""
}

###########################################
# Toggle provisioning of resources below
###########################################

variable "enable_google_monitoring_alert_policy_example" {
  type = bool
  default = true
}
