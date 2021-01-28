resource "random_id" "rnd" {
  byte_length = 4
}

resource "google_dns_managed_zone" "example-zone" {
  name        = "example-public-zone"
  dns_name    = "example-${random_id.rnd.hex}.com."
  description = "Example DNS zone"
}
