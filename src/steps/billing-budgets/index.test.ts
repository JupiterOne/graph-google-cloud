import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  buildBillingAccountBudgetRelationships,
  buildAdditionalProjectBudgetRelationships,
  buildProjectBudgetRelationships,
  fetchBillingBudgets,
} from '.';
import {
  buildOrgFolderProjectMappedRelationships,
  fetchResourceManagerOrganization,
  fetchResourceManagerProject,
  PROJECT_ENTITY_TYPE,
} from '../resource-manager/index';
import {
  ENTITY_TYPE_BILLING_BUDGET,
  RELATIONSHIP_TYPE_PROJECT_HAS_BUDGET,
} from './constants';
import {
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import { fetchBillingAccounts } from '../cloud-billing';

describe('#fetchBillingBudget', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchBillingBudget',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchBillingAccounts(context);
    await fetchBillingBudgets(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_BILLING_BUDGET,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Ruleset'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_billing_budget' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          projects: { type: 'array', items: { type: 'string' } },
          billingAccount: { type: 'string' },
          specifiedAmoutCurrencyCode: { type: 'string' },
          specifiedAmoutUnits: { type: 'string' },
          specifiedAmoutNanos: { type: 'string' },
          pubsubTopic: { type: 'string' },
          schemaVersion: { type: 'string' },
          monitoringNotificationChannels: { type: 'string' },
          disableDefaultIamRecipients: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });
  });
});

describe('#buildBillingAccountBudgetRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildBillingAccountBudgetRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchBillingAccounts(context);
    await fetchBillingBudgets(context);
    await buildBillingAccountBudgetRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
  });
});

describe('#buildProjectBudgetRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildProjectBudgetRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships, rest: mappedProjectRelationships } =
      filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
        targets: ExplicitRelationship[];
        rest: MappedRelationship[];
      };
    return {
      directRelationships,
      mappedProjectRelationships,
    };
  }

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });

    await fetchBillingAccounts(context);
    await fetchBillingBudgets(context);
    await fetchResourceManagerProject(context);
    await buildProjectBudgetRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === PROJECT_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_project' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          parent: { type: 'string' },
          lifecycleState: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_BILLING_BUDGET,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Ruleset'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_billing_budget' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          billingAccount: { type: 'string' },
          projects: { type: 'array', items: { type: 'string' } },
          specifiedAmoutCurrencyCode: { type: 'string' },
          specifiedAmoutUnits: { type: 'string' },
          specifiedAmoutNanos: { type: 'string' },
          pubsubTopic: { type: 'string' },
          schemaVersion: { type: 'string' },
          monitoringNotificationChannels: { type: 'string' },
          disableDefaultIamRecipients: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });

    const { directRelationships, mappedProjectRelationships } =
      separateRelationships(context.jobState.collectedRelationships);

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PROJECT_HAS_BUDGET,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_cloud_project_has_billing_budget',
          },
        },
      },
    });

    expect(mappedProjectRelationships.length).toBeGreaterThan(0);
    const budgetEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === ENTITY_TYPE_BILLING_BUDGET,
    );

    expect(
      mappedProjectRelationships.filter(
        (e) => e._mapping.sourceEntityKey === 'projects/538466736102',
      ),
    ).toTargetEntities(budgetEntities);
  });
});

describe('#buildAdditionalProjectBudgetRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildAdditionalProjectBudgetRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships, rest: mappedProjectRelationships } =
      filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
        targets: ExplicitRelationship[];
        rest: MappedRelationship[];
      };
    return {
      directRelationships,
      mappedProjectRelationships,
    };
  }

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });

    await fetchResourceManagerOrganization(context);
    await buildOrgFolderProjectMappedRelationships(context);
    await fetchBillingAccounts(context);
    await fetchResourceManagerProject(context);
    await fetchBillingBudgets(context);
    await buildAdditionalProjectBudgetRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === PROJECT_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_project' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          parent: { type: 'string' },
          lifecycleState: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_BILLING_BUDGET,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Ruleset'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_billing_budget' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          billingAccount: { type: 'string' },
          projects: { type: 'array', items: { type: 'string' } },
          specifiedAmoutCurrencyCode: { type: 'string' },
          specifiedAmoutUnits: { type: 'string' },
          specifiedAmoutNanos: { type: 'string' },
          pubsubTopic: { type: 'string' },
          schemaVersion: { type: 'string' },
          monitoringNotificationChannels: { type: 'string' },
          disableDefaultIamRecipients: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });

    const { directRelationships, mappedProjectRelationships } =
      separateRelationships(context.jobState.collectedRelationships);

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PROJECT_HAS_BUDGET,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_cloud_project_has_billing_budget',
          },
        },
      },
    });

    expect(mappedProjectRelationships.length).toBeGreaterThan(0);
    const budgetEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === ENTITY_TYPE_BILLING_BUDGET,
    );

    expect(
      mappedProjectRelationships.filter(
        (e) => e._mapping.sourceEntityKey === 'projects/538466736102',
      ),
    ).toTargetEntities(budgetEntities);
  });
});
