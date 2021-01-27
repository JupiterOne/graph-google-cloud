resource "google_logging_project_sink" "instance-sink" {
  name        = "my-instance-sink"
  description = "an example sink"
  destination = "storage.googleapis.com/${google_storage_bucket.sink-log-bucket.name}"
  filter      = ""

  unique_writer_identity = false
}

resource "google_logging_metric" "logging_metric" {
  name   = "my-example-metric"
  filter = "protoPayload.methodName=\"SetIamPolicy\" AND protoPayload.serviceData.policyDelta.auditConfigDeltas:*"
  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
    labels {
      key         = "occurences"
      value_type  = "INT64"
    }
    display_name = "My metric"
  }
  label_extractors = {
    "occurences" = "EXTRACT(textPayload)"
  }
}
