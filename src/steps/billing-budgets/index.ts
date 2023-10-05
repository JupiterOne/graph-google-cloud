import {
  createDirectRelationship,
  createMappedRelationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_ORGANIZATION,
  STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { BillingBudgetClient } from './client';
import {
  ENTITY_CLASS_BILLING_BUDGET,
  ENTITY_TYPE_BILLING_BUDGET,
  RELATIONSHIP_TYPE_BILLING_ACCOUNT_HAS_BUDGET,
  RELATIONSHIP_TYPE_PROJECT_HAS_BUDGET,
  STEP_BILLING_BUDGETS,
  STEP_BUILD_ACCOUNT_BUDGET,
  STEP_BUILD_ADDITIONAL_PROJECT_BUDGET,
  STEP_BUILD_PROJECT_BUDGET,
} from './constants';
import { createBillingBudgetEntity } from './converters';
import { getProjectEntity } from '../../utils/project';
import {
  ENTITY_TYPE_BILLING_ACCOUNT,
  STEP_BILLING_ACCOUNTS,
} from '../cloud-billing/constants';
import { CloudBillingClient } from '../cloud-billing/client';
import { getProjectNameFromId } from '../../utils/jobState';

export async function fetchBillingBudgets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new BillingBudgetClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_BILLING_ACCOUNT },
    async (accountEntity) => {
      await client.iterateBudgets(
        accountEntity.name as string,
        async (budget) => {
          await jobState.addEntity(
            createBillingBudgetEntity({
              billingAccount: accountEntity.name as string,
              data: budget,
            }),
          );
        },
      );
    },
  );
}

export async function buildBillingAccountBudgetRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_BILLING_BUDGET },
    async (budgetEntity) => {
      const accountEntity = await jobState.findEntity(
        budgetEntity.billingAccount as string,
      );

      if (budgetEntity && accountEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: accountEntity,
            to: budgetEntity,
          }),
        );
      }
    },
  );
}

export async function buildProjectBudgetRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  const projectEntity = await getProjectEntity(jobState);

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_BILLING_BUDGET,
    },
    async (budgetEntity) => {
      if (budgetEntity.projects) {
        for (const project of budgetEntity.projects as string[]) {
          if (project === projectEntity.name) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: projectEntity,
                to: budgetEntity,
              }),
            );
          } else {
            await jobState.addRelationship(
              createMappedRelationship({
                _class: RelationshipClass.HAS,
                _type: RELATIONSHIP_TYPE_PROJECT_HAS_BUDGET,
                _mapping: {
                  relationshipDirection: RelationshipDirection.REVERSE,
                  sourceEntityKey: budgetEntity._key,
                  targetFilterKeys: [['_type', '_key']],
                  skipTargetCreation: true,
                  targetEntity: {
                    _type: PROJECT_ENTITY_TYPE,
                    _key: project,
                  },
                },
              }),
            );
          }
        }
      }
    },
  );
}

/*
Budget can be assigned to one or more projects, but only to those that are in the scope of the (owning) billing account. 
The GCP convention is that if the budget entity's projects field is undefined it means "this budget is assigned/affects all the projects but again only those that are covered by the billing_account". We've introduced this buildAdditionalProjectBudgetRelationships step function for this which makes use of two things:

1) iterateBillingAccountProjects allows us to find out what projects fall under this billing account's territory

2) but we also needed to make this step function depend on ENV configureOrganizationProjects value, because we need integration to have already traversed those projects because of the discrepancy between the values we've used for project's keys and the values we get out of iterateBillingAccountProjects. As an example, we get my-project-name but we need projects/167984947943, so we needed to convert it.
*/
export async function buildAdditionalProjectBudgetRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudBillingClient({ config }, logger);
  const projectEntity = await getProjectEntity(jobState);

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_BILLING_BUDGET,
    },
    async (budgetEntity) => {
      // If projects array is undefined, it means that this particular budget
      // is assigned to all the projects that are part of the same cloud billing account
      // that budget is part of
      if (budgetEntity.projects == undefined) {
        await client.iterateBillingAccountProjects(
          budgetEntity.billingAccount as string,
          async (project) => {
            const projectName = await getProjectNameFromId(
              jobState,
              project.projectId as string,
            );

            if (projectName) {
              if (projectName === projectEntity.name) {
                await jobState.addRelationship(
                  createDirectRelationship({
                    _class: RelationshipClass.HAS,
                    from: projectEntity,
                    to: budgetEntity,
                  }),
                );
              } else {
                await jobState.addRelationship(
                  createMappedRelationship({
                    _class: RelationshipClass.HAS,
                    _type: RELATIONSHIP_TYPE_PROJECT_HAS_BUDGET,
                    _mapping: {
                      relationshipDirection: RelationshipDirection.FORWARD,
                      sourceEntityKey: projectName,
                      targetFilterKeys: [['_type', '_key']],
                      skipTargetCreation: true,
                      targetEntity: {
                        ...budgetEntity,
                        _rawData: undefined,
                      },
                    },
                  }),
                );
              }
            }
          },
        );
      }
    },
  );
}

export const billingBudgetsSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_BILLING_BUDGETS,
    name: 'Billing Budgets',
    entities: [
      {
        resourceName: 'Billing Budget',
        _type: ENTITY_TYPE_BILLING_BUDGET,
        _class: ENTITY_CLASS_BILLING_BUDGET,
      },
    ],
    relationships: [],
    dependsOn: [STEP_BILLING_ACCOUNTS],
    executionHandler: fetchBillingBudgets,
    permissions: ['billing.budgets.list'],
    apis: ['cloudbilling.googleapis.com'],
  },
  {
    id: STEP_BUILD_ACCOUNT_BUDGET,
    name: 'Build Billing Accounts Budgets Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BILLING_ACCOUNT_HAS_BUDGET,
        sourceType: ENTITY_TYPE_BILLING_ACCOUNT,
        targetType: ENTITY_TYPE_BILLING_BUDGET,
      },
    ],
    dependsOn: [STEP_BILLING_BUDGETS],
    executionHandler: buildBillingAccountBudgetRelationships,
  },
  {
    id: STEP_BUILD_PROJECT_BUDGET,
    name: 'Build Project Budget',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_BUDGET,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: ENTITY_TYPE_BILLING_BUDGET,
      },
    ],
    dependsOn: [STEP_BILLING_BUDGETS, STEP_RESOURCE_MANAGER_PROJECT],
    executionHandler: buildProjectBudgetRelationships,
  },
  {
    id: STEP_BUILD_ADDITIONAL_PROJECT_BUDGET,
    name: 'Build Additional Project Budget Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_BUDGET,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: ENTITY_TYPE_BILLING_BUDGET,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_ORGANIZATION,
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
      STEP_BILLING_BUDGETS,
    ],
    executionHandler: buildAdditionalProjectBudgetRelationships,
    permissions: ['cloudasset.assets.listCloudbillingProjectBillingInfos'],
    apis: ['cloudbilling.googleapis.com'],
  },
];
