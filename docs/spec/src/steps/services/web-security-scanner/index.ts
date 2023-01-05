import {
  IntegrationInstanceConfig,
  RelationshipClass,
  StepSpec,
} from '@jupiterone/integration-sdk-core';

export const webSecurityScannerSteps: StepSpec<IntegrationInstanceConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.google.com/security-command-center/docs/reference/web-security-scanner/rest/v1/projects.scanConfigs/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: cloudsecurityscanner.scans.list
     */
    id: 'fetch-scan-configs',
    name: 'Fetch Scan Configs',
    entities: [
      {
        resourceName: 'Scan Config',
        _type: 'google_cloud_scan_config',
        _class: ['Configuration'],
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: true,
  },
  {
    /**
     * ENDPOINT: https://cloud.google.com/security-command-center/docs/reference/web-security-scanner/rest/v1/projects.scanConfigs.scanRuns/list
     *           https://cloud.google.com/security-command-center/docs/reference/web-security-scanner/rest/v1/projects.scanConfigs.scanRuns.crawledUrls/list
     * PATTERN: Fetch Child Entities
     * REQUIRED PERMISSIONS: cloudsecurityscanner.scanruns.list
     *                       cloudsecurityscanner.crawledurls.list
     */
    id: 'fetch-scan-runs',
    name: 'Fetch Scan Runs',
    entities: [
      {
        resourceName: 'Scan Run',
        _type: 'google_cloud_scan_run',
        _class: ['Process', 'Task'],
      },
    ],
    relationships: [
      {
        _type: 'google_cloud_scan_config_performed_run',
        sourceType: 'google_cloud_scan_config',
        _class: RelationshipClass.PERFORMED,
        targetType: 'google_cloud_scan_run',
      },
    ],
    dependsOn: ['fetch-scan-configs'],
    implemented: true,
  },
  {
    /**
     * ENDPOINT: https://cloud.google.com/security-command-center/docs/reference/web-security-scanner/rest/v1/projects.scanConfigs.scanRuns.findings/list
     * PATTERN: Fetch Child Entities
     * REQUIRED PERMISSIONS: cloudsecurityscanner.results.list
     */
    id: 'fetch-scan-run-findings',
    name: 'Fetch Scan Run Findings',
    entities: [
      {
        resourceName: 'Scan Run Finding',
        _type: 'google_cloud_scan_run_finding',
        _class: ['Finding'],
      },
    ],
    relationships: [
      {
        _type: 'google_cloud_scan_run_has_finding',
        sourceType: 'google_cloud_scan_run',
        _class: RelationshipClass.HAS,
        targetType: 'google_cloud_scan_run_finding',
      },
    ],
    dependsOn: ['fetch-scan-runs'],
    implemented: false,
  },
];
