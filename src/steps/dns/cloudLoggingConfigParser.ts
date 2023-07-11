import { dns_v1 } from 'googleapis';

const parseEnableLoggingStatus = (
  cloudLoggingConfig?: dns_v1.Schema$ManagedZoneCloudLoggingConfig,
): boolean => {
  if (cloudLoggingConfig === undefined || cloudLoggingConfig === null) {
    return false;
  }

  if (
    cloudLoggingConfig.enableLogging === undefined ||
    cloudLoggingConfig.enableLogging === null
  ) {
    return false;
  }

  return cloudLoggingConfig.enableLogging;
};

export const cloudLoggingConfigParser = {
  parseEnableLoggingStatus,
};
