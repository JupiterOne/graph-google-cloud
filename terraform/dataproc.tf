resource "google_dataproc_cluster" "example_dataproc_simplecluster" {
  count = var.enable_dataproc_cluster ? 1 : 0
  name   = "simplecluster"
  region = "us-central1"
}
