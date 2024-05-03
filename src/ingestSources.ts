import { IntegrationIngestionConfigFieldMap } from '@jupiterone/integration-sdk-core';
import { AccessContextManagerIngestionConfig } from './steps/access-context-manager/constants';
import { ApiGatewayIngestionConfig } from './steps/api-gateway/constants';
import { AppEngineIngestionConfig } from './steps/app-engine/constants';
import { BigQueryIngestionConfig } from './steps/big-query';
import { BigTableIngestionConfig } from './steps/big-table/constants';
import { BillingBudgetsIngestionConfig } from './steps/billing-budgets/constants';
import { BinaryAuthorizationIngestionConfig } from './steps/binary-authorization/constants';
import { CloudAssetIngestionConfig } from './steps/cloud-asset/constants';
import { CloudBillingIngestionConfig } from './steps/cloud-billing/constants';
import { CloudBuildIngestionConfig } from './steps/cloud-build/constants';
import { CloudRunIngestionConfig } from './steps/cloud-run/constants';
import { CloudSourceRepositoriesIngestionConfig } from './steps/cloud-source-repositories/constants';
import { ComputeIngestionConfig } from './steps/compute';
import { ContainersIngestionConfig } from './steps/containers';
import { DataprocIngestionConfig } from './steps/dataproc/constants';
import { DnsIngestionConfig } from './steps/dns/constants';
import { FunctionsIngestionConfig } from './steps/functions';
import { IamIngestionConfig } from './steps/iam';
import { KmsIngestionConfig } from './steps/kms';
import { LoggingIngestionConfig } from './steps/logging/constants';
import { MemcacheIngestionConfig } from './steps/memcache/constants';
import { MonitoringIngestionConfig } from './steps/monitoring/constants';
import { PrivatecaIngestionConfig } from './steps/privateca/constants';
import { PubSubIngestionConfig } from './steps/pub-sub/constants';
import { RedisIngestionConfig } from './steps/redis/constants';
import { ResourceManagerIngestionConfig } from './steps/resource-manager';
import { SecretManagerIngestionConfig } from './steps/secret-manager/constants';
import { ServiceUsageIngestionConfig } from './steps/service-usage/constants';
import { SpannerIngestionConfig } from './steps/spanner/constants';
import { SQLAdminIngestionConfig } from './steps/sql-admin';
import { StorageIngestionConfig } from './steps/storage/constants';
import { WebSecurityScannerIngestionConfig } from './steps/web-security-scanner/constants';
import { PolicyIntelligenceIngestionConfig } from './steps/policy-intelligence/constants';

export const ingestionConfig: IntegrationIngestionConfigFieldMap = {
  ...AccessContextManagerIngestionConfig,
  ...ApiGatewayIngestionConfig,
  ...ApiGatewayIngestionConfig,
  ...AppEngineIngestionConfig,
  ...BigQueryIngestionConfig,
  ...BigTableIngestionConfig,
  ...BillingBudgetsIngestionConfig,
  ...BinaryAuthorizationIngestionConfig,
  ...CloudAssetIngestionConfig,
  ...CloudBillingIngestionConfig,
  ...CloudBuildIngestionConfig,
  ...CloudRunIngestionConfig,
  ...CloudSourceRepositoriesIngestionConfig,
  ...ComputeIngestionConfig,
  ...ContainersIngestionConfig,
  ...DataprocIngestionConfig,
  ...DnsIngestionConfig,
  ...FunctionsIngestionConfig,
  ...IamIngestionConfig,
  ...KmsIngestionConfig,
  ...LoggingIngestionConfig,
  ...MemcacheIngestionConfig,
  ...MonitoringIngestionConfig,
  ...PrivatecaIngestionConfig,
  ...PubSubIngestionConfig,
  ...RedisIngestionConfig,
  ...ResourceManagerIngestionConfig,
  ...SecretManagerIngestionConfig,
  ...ServiceUsageIngestionConfig,
  ...SpannerIngestionConfig,
  ...SQLAdminIngestionConfig,
  ...StorageIngestionConfig,
  ...WebSecurityScannerIngestionConfig,
  ...PolicyIntelligenceIngestionConfig
};
