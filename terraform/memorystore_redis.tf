resource "google_redis_instance" "example_redis_instance" {
  count = var.enable_redis_instance_example ? 1 : 0
  name           = "example-redis-instance"
  tier           = "BASIC"
  memory_size_gb = 1

  location_id             = "us-central1-a"

  authorized_network = google_compute_network.public_compute_vpc.id

  redis_version     = "REDIS_5_0"
  display_name      = "Example Redis Instance"
  reserved_ip_range = "192.168.0.0/29"

  labels = {
    my_key    = "my_val"
  }
}
