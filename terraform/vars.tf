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

variable "enable_redis_instance_example" {
  type = bool
  default = false
}

variable "enable_spanner_example" {
  type = bool
  default = false
}

variable "enable_gke_cluster" {
  type = bool
  default = false
}

variable "enable_compute_vm_no_internet" {
  type = bool
  default = false
}

variable "enable_compute_vm_internet" {
  type = bool
  default = false
}

variable "enable_testvm_not_accesible_internet_custom_image_snapshot" {
  type = bool
  default = true # TODO: Switch to false
}

variable "enable_postgres_instance" {
  type = bool
  default = false
}

variable "enable_mysql_instance" {
  type = bool
  default = false
}

variable "enable_dataproc_cluster" {
  type = bool
  default = false
}

variable "enable_pubsub_example" {
  type = bool
  default = false
}

variable "enable_forwarding_rule_external_example" {
  type = bool
  default = false
}

variable "enable_forwarding_rule_internal_example" {
  type = bool
  default = false
}

variable "enable_global_forwarding_rule_example" {
  type = bool
  default = false
}

variable "enable_global_address_with_network_example" {
  type = bool
  default = false
}

variable "enable_google_bigtable_example" {
  type = bool
  default = false
}

variable "enable_google_dns_policy_example" {
  type = bool
  default = false
}
