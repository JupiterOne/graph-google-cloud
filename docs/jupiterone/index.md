# Integration with JupiterOne

## Google Cloud + JupiterOne Integration Benefits

- Visualize Google Cloud resources in the JupiterOne graph.
- Map Google users to employees in your JupiterOne account.
- Monitor visibility and governance of your Google Cloud environment by
  leveraging hundreds of out of the box queries.
- Monitor compliance against the Google Cloud CIS Framework and other security
  benchmarks using the JupiterOne compliance app.
- Monitor changes to your Google Cloud resources using multiple JupiterOne alert
  rule packs specific to Google Cloud.

## How it Works

- JupiterOne periodically fetches users and cloud resources from Google Cloud to
  update the graph.
- Write JupiterOne queries to review and monitor updates to the graph, or
  leverage existing queries.
- Configure alerts to take action when the JupiterOne graph changes, or leverage
  existing alerts.

## Requirements

- JupiterOne requires the contents of a Google Cloud service account key file
  with the correct API services enabled (see the **Integration Walkthrough**).
- You must have permission in JupiterOne to install new integrations.

## Support

If you need help with this integration, please contact
[JupiterOne Support](https://support.jupiterone.io).

## Integration Walkthrough

There are two methods of running the integration - (1) running it against single
Google Cloud project and letting J1 ingest target project's data or (2)
designating a particular Google Cloud project to be `main` and letting J1 also
ingest other projects data.

The necessary steps for both approches can be done either by using GCP CLI tool
or by using GCP console.

[Single project ingestion via gcloud CLI tool](./single-project-gcloud.md)

[Single project ingestion via Google Console](./single-project-console.md)

[Multi-project ingestion via gcloud CLI tool](./multi-project-gcloud.md)

[Multi-project ingestion via Google Console](./multi-project-console.md)
