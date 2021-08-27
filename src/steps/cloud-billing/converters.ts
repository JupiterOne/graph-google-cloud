import { cloudbilling_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_BILLING_ACCOUNT,
  ENTITY_TYPE_BILLING_ACCOUNT,
} from './constants';

export function createBillingAccountEntity(
  data: cloudbilling_v1.Schema$BillingAccount,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_BILLING_ACCOUNT,
        _type: ENTITY_TYPE_BILLING_ACCOUNT,
        _key: data.name as string,
        name: data.name,
        displayName: data.displayName as string,
        open: data.open,
        masterBillingAccount: data.masterBillingAccount,
      },
    },
  });
}
