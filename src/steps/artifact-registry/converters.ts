import { artifactregistry_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ARTIFACT_REGISTRY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  ARTIFACT_REGISTRY_TYPE,
  ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_CLASS,
  ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_TYPE,
  ARTIFACT_REGISTRY_VPCSC_POLICY_CLASS,
  ARTIFACT_REGISTRY_VPCSC_POLICY_TYPE,
  ARTIFACT_REPOSITORY_PACKAGE_CLASS,
  ARTIFACT_REPOSITORY_PACKAGE_TYPE,
} from './constants';

export function createArtifactRegistryRepositoryEntity(
  data: artifactregistry_v1.Schema$Repository,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ARTIFACT_REGISTRY_REPOSITORY_TYPE,
        _class: ARTIFACT_REGISTRY_REPOSITORY_CLASS,
        name: data.name,
        createdTime: data.createTime,
        updatedTime: data.updateTime,
        format: data.format,
        mode: data.mode,
        kmsKey: data.kmsKeyName,
      },
    },
  });
}

export function createArtifactRepositoryPackageEntity(
  data: artifactregistry_v1.Schema$Package,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ARTIFACT_REPOSITORY_PACKAGE_TYPE,
        _class: ARTIFACT_REPOSITORY_PACKAGE_CLASS,
        name: data.name,
        createdTime: data.createTime,
        updatedTime: data.updateTime,
        repositoryName: data.name as string,
      },
    },
  });
}

export function createArtifactRegistryEntity(
  organizationId: string,
  data: any,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: (organizationId + '_' + ARTIFACT_REGISTRY_TYPE) as string,
        _type: ARTIFACT_REGISTRY_TYPE,
        _class: ARTIFACT_REGISTRY_CLASS,
        name: 'Artifact Registry Service',
        function: ['container-registry'],
        category: ['software'],
        endpoint: 'http://console.cloud.google.com/',
      },
    },
  });
}

function getVpcscPolicyStatus(data) {
  if (
    data.spec.restrictedServices.includes('artifactregistry.googleapis.com')
  ) {
    return 'DENY';
  } else if (
    data.spec?.vpcAccessibleServices?.allowedServices?.includes(
      'artifactregistry.googleapis.com',
    )
  ) {
    return 'ALLOW';
  } else {
    return 'VPCSC_POLICY_UNSPECIFIED';
  }
}

export function createArtifactRegistryVpcscConfigEntity(
  data,
  projectId: string,
) {
  const vpcPolicyStatus = getVpcscPolicyStatus(data);
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: `Artifact_VPC_SC_CONFIG:${data.title}`,
        _type: ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_TYPE,
        _class: ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_CLASS,
        name: data.title,
        VPCSCPolicy: vpcPolicyStatus,
        projectId: projectId,
      },
    },
  });
}

export function createArtifactRegistryVpcPolicyEntity(data, projectId: string) {
  const vpcPolicyStatus = getVpcscPolicyStatus(data);
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: `Artifact_VPC_SC_Policy:${data.name.split('/')[1]}`,
        _type: ARTIFACT_REGISTRY_VPCSC_POLICY_TYPE,
        _class: ARTIFACT_REGISTRY_VPCSC_POLICY_CLASS,
        name: `Artifact Policy: ${data.name.split('/')[1]}`,
        VPCSCPolicy: vpcPolicyStatus,
        projectId: projectId,
      },
    },
  });
}
