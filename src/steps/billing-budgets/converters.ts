import { billingbudgets_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_BILLING_BUDGET,
  ENTITY_TYPE_BILLING_BUDGET,
} from './constants';

export function createBillingBudgetEntity({
  billingAccount,
  data,
}: {
  billingAccount: string;
  data: billingbudgets_v1.Schema$GoogleCloudBillingBudgetsV1Budget;
}) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_BILLING_BUDGET,
        _type: ENTITY_TYPE_BILLING_BUDGET,
        _key: data.name as string,
        name: data.name,
        displayName: data.displayName as string,
        projects: data.budgetFilter?.projects,
        billingAccount,
        specifiedAmoutCurrencyCode: data.amount?.specifiedAmount?.currencyCode,
        specifiedAmoutUnits: data.amount?.specifiedAmount?.units,
        specifiedAmoutNanos: data.amount?.specifiedAmount?.nanos,
        pubsubTopic: data.notificationsRule?.pubsubTopic,
        schemaVersion: data.notificationsRule?.schemaVersion,
        monitoringNotificationChannels:
          data.notificationsRule?.monitoringNotificationChannels,
        disableDefaultIamRecipients:
          data.notificationsRule?.disableDefaultIamRecipients,
        etag: data.etag,
      },
    },
  });
}
