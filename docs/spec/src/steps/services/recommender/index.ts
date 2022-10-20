import {
  IntegrationInstanceConfig,
  RelationshipClass,
  StepSpec,
} from '@jupiterone/integration-sdk-core';

export const recommenderSteps: StepSpec<IntegrationInstanceConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.google.com/recommender/docs/reference/rest/v1/projects.locations.insightTypes.insights/list
     *           https://recommender.googleapis.com/v1/projects/PROJECT_ID/locations/global/insightTypes/google.iam.serviceAccount.Insight/insights
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: recommender.iamServiceAccountInsights.list
     */
    id: 'fetch-iam-service-accounts-insights',
    name: 'Fetch IAM Service Accounts insights',
    entities: [
      {
        resourceName: 'IAM Service Account Insight',
        _type: 'google_iam_service_account_insight',
        _class: ['Finding'],
      },
    ],
    relationships: [],
    dependsOn: ['fetch-resource-manager-project'],
    implemented: false,
  },
  {
    /**
     * PROPERTY: google_iam_service_account_recommender_finding.content.serviceAccountId
     * PATTERN: Build Child Relationships
     */
    id: 'build-iam-service-account-has-insight-relationships',
    name: 'Build IAM Service Account -> IAM Service Account Insight Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_iam_service_account_has_insight',
        _class: RelationshipClass.HAS,
        sourceType: 'google_iam_service_account',
        targetType: 'google_iam_service_account_insight',
      },
    ],
    dependsOn: [
      'fetch-iam-service-accounts',
      'fetch-iam-service-accounts-insights',
    ],
    implemented: false,
  },
];
