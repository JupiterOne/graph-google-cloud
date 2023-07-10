import { dns_v1 } from 'googleapis';

const parseEnableLoggingStatus = (
  cloudLoggingConfig?: dns_v1.Schema$ManagedZoneCloudLoggingConfig,
): 'on' | 'off' => {
  if (cloudLoggingConfig === undefined || cloudLoggingConfig === null) {
    return 'off';
  }

  if (
    cloudLoggingConfig.enableLogging === undefined ||
    cloudLoggingConfig.enableLogging === null
  ) {
    return 'off';
  }

  return cloudLoggingConfig.enableLogging ? 'on' : 'off';
};

export const cloudLoggingConfigParser = {
  parseEnableLoggingStatus,
};
