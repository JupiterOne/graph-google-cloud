resource "google_pubsub_topic" "example" {
  name         = "example-topic"
  kms_key_name = google_kms_crypto_key.topic_crypto_key.id
}

resource "google_pubsub_topic" "example_dead_letter" {
  name = "example-topic-dead-letter"
}

resource "google_kms_crypto_key" "topic_crypto_key" {
  name     = "example-key"
  key_ring = google_kms_key_ring.topic_key_ring.id
}

resource "google_kms_key_ring" "topic_key_ring" {
  name     = "example-topic-keyring"
  location = "global"
}

resource "google_pubsub_subscription" "example" {
  count = var.enable_pubsub_example ? 1 : 0
  name  = "example-subscription"
  topic = google_pubsub_topic.example.name

  dead_letter_policy {
    dead_letter_topic = google_pubsub_topic.example_dead_letter.id
    max_delivery_attempts = 10
  }
}
