import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { websecurityscanner_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { WebSecurityScannerEntities } from './constants';

export const createScanConfigEntity = (
  scanConfig: websecurityscanner_v1.Schema$ScanConfig,
) => {
  return createGoogleCloudIntegrationEntity(scanConfig, {
    entityData: {
      source: scanConfig,
      assign: {
        _class: WebSecurityScannerEntities.SCAN_CONFIG._class,
        _type: WebSecurityScannerEntities.SCAN_CONFIG._type,
        _key: scanConfig.name as string,
        name: scanConfig.displayName,
        maxQps: scanConfig.maxQps,
        startingUrls: scanConfig.startingUrls,
        userAgent: scanConfig.userAgent,
        exportToSecurityCommandCenter: scanConfig.exportToSecurityCommandCenter,
        riskLevel: scanConfig.riskLevel,
      },
    },
  });
};

export const createScanRunEntity = (
  scanRun: websecurityscanner_v1.Schema$ScanRun,
) => {
  return createGoogleCloudIntegrationEntity(scanRun, {
    entityData: {
      source: scanRun,
      assign: {
        _class: WebSecurityScannerEntities.SCAN_RUN._class,
        _type: WebSecurityScannerEntities.SCAN_RUN._type,
        _key: scanRun.name as string,
        executionState: scanRun.executionState,
        urlsCrawledCount: scanRun.urlsCrawledCount,
        urlsTestedCount: scanRun.urlsTestedCount,
        hasVulnerabilities: scanRun.hasVulnerabilities,
        progressPercent: scanRun.progressPercent,
        open: true,
        'errorTrace.code': scanRun.errorTrace?.code,
        'errorTrace.mostCommonHttpErrorCode':
          scanRun.errorTrace?.mostCommonHttpErrorCode,
        'errorTrace.scanConfigError.code':
          scanRun.errorTrace?.scanConfigError?.code,
        'errorTrace.scanConfigError.fieldName':
          scanRun.errorTrace?.scanConfigError?.fieldName,
        startTime: parseTimePropertyValue(scanRun.startTime),
        endTime: parseTimePropertyValue(scanRun.endTime),
      },
    },
  });
};
