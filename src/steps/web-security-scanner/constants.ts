import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export const WebSecurityScannerSteps = {
  FETCH_SCAN_CONFIGS: {
    id: 'fetch-scan-configs',
    name: 'Fetch Scan Configs',
  },
  FETCH_SCAN_RUNS: {
    id: 'fetch-scan-runs',
    name: 'Fetch Scan Runs',
  },
  FETCH_SCAN_RUNS_FINDINGS: {
    id: 'fetch-scan-run-findings',
    name: 'fetch-scan-run-findings',
  },
};

export const WebSecurityScannerEntities = {
  SCAN_CONFIG: {
    resourceName: 'Scan Config',
    _type: 'google_cloud_scan_config',
    _class: ['Configuration'],
  },
  SCAN_RUN: {
    resourceName: 'Scan Run',
    _type: 'google_cloud_scan_run',
    _class: ['Process', 'Task'],
  },
  SCAN_RUN_FINDING: {
    resourceName: 'Scan Run Finding',
    _type: 'google_cloud_scan_run_finding',
    _class: ['Finding'],
  },
};

export const WebSecurityScannerRelationships = {
  GOOGLE_CLOUD_SCAN_CONFIG_PERFORMED_SCAN_RUN: {
    _type: 'google_cloud_scan_config_performed_run',
    _class: RelationshipClass.PERFORMED,
    sourceType: WebSecurityScannerEntities.SCAN_CONFIG._type,
    targetType: WebSecurityScannerEntities.SCAN_RUN._type,
  },
  GOOGLE_CLOUD_SCAN_RUN_HAS_FINDING: {
    _type: 'google_cloud_scan_run_has_finding',
    _class: RelationshipClass.HAS,
    sourceType: WebSecurityScannerEntities.SCAN_RUN._type,
    targetType: WebSecurityScannerEntities.SCAN_RUN_FINDING._type,
  },
};
