resource "google_monitoring_alert_policy" "example_alert_policy" {
  count = var.enable_google_monitoring_alert_policy_example ? 1 : 0
  display_name = "Example Alert Policy"
  combiner     = "OR"

  conditions {
    display_name = "test condition"
    condition_threshold {
      filter     = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.logging_metric.name}\" AND resource.type=\"metric\""
      duration   = "0s"
      comparison = "COMPARISON_GT"
      trigger {
        count = 1
      }
      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }
  enabled = true
}
