import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_CLASS_CLOUD_DEPLOY_SERVICE,
  ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
  STEP_CLOUD_DEPLOY_SERVICE,
} from '../constant';
import { IngestionSources } from '../constant';
import { getCloudDeployServiceEntity } from '../converter';

export async function fetchCloudDeploySevice(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = context;

  const projectId = instance.config.projectId;
  const organizationId = instance.config.organizationId;
  const instanceId = instance.id;

  await jobState.addEntity(
    getCloudDeployServiceEntity({ projectId, organizationId, instanceId }),
  );
}

export const fetchCloudDeployServiceStep: GoogleCloudIntegrationStep = {
  id: STEP_CLOUD_DEPLOY_SERVICE,
  ingestionSourceId: IngestionSources.CLOUD_DEPLOY_SERVICE,
  name: 'Cloud Deploy Service',
  entities: [
    {
      resourceName: 'Cloud Deploy Service',
      _type: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
      _class: ENTITY_CLASS_CLOUD_DEPLOY_SERVICE,
    },
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchCloudDeploySevice,
};
