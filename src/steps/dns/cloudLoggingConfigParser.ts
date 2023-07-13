import { dns_v1 } from 'googleapis';

type ManagedZoneCloudLoggingConfigStatus = 'disabled' | 'enabled';

const parseEnableLoggingStatus = (
  cloudLoggingConfig?: dns_v1.Schema$ManagedZoneCloudLoggingConfig,
): ManagedZoneCloudLoggingConfigStatus => {
  if (cloudLoggingConfig === undefined || cloudLoggingConfig === null) {
    return 'disabled';
  }

  if (
    cloudLoggingConfig.enableLogging === undefined ||
    cloudLoggingConfig.enableLogging === null
  ) {
    return 'disabled';
  }

  return cloudLoggingConfig.enableLogging ? 'enabled' : 'disabled';
};

export const cloudLoggingConfigParser = {
  parseEnableLoggingStatus,
};
