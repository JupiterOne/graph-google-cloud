# VPC that auto-creates the subnets
resource "google_compute_network" "test_vpc_network" {
  name = "test-vpc-network"
  description = "Test description"

  # The following is the default
  # auto_create_subnetworks = true
}
