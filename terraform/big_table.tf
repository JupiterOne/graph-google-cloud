resource "google_bigtable_instance" "instance" {
  count = var.enable_google_bigtable_example ? 1 : 0
  name = "bt-instance"
  cluster {
    cluster_id   = "bt-instance"
    zone         = "us-central1-b"
    num_nodes    = 3
    storage_type = "HDD"
  }

  deletion_protection  = "true"
}

resource "google_bigtable_app_profile" "ap" {
  count = var.enable_google_bigtable_example ? 1 : 0
  instance       = google_bigtable_instance.instance[count.index].name
  app_profile_id = "bt-profile"

  single_cluster_routing {
    cluster_id                 = "bt-instance"
    allow_transactional_writes = true
  }

  ignore_warnings = true
}

resource "google_bigtable_table" "table" {
  count = var.enable_google_bigtable_example ? 1 : 0
  name          = "tf-table"
  instance_name = google_bigtable_instance.instance[count.index].name
  split_keys    = ["a", "b", "c"]

  lifecycle {
    prevent_destroy = true
  }
}