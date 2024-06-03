import {
  Recording,
  StepTestConfig,
  createMockStepExecutionContext,
  executeStepWithDependencies,
  filterGraphObjects,
} from '@jupiterone/integration-sdk-testing';
import {
  ARTIFACT_REGISTRY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  ARTIFACT_REGISTRY_TYPE,
  ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_CLASS,
  ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_TYPE,
  ARTIFACT_REGISTRY_VPCSC_POLICY_CLASS,
  ARTIFACT_REGISTRY_VPCSC_POLICY_TYPE,
  ARTIFACT_REPOSITORY_PACKAGE_TYPE,
  RELATIONSHIP_ARTIFACT_REGISTRY_REPOSITORY_USES_KMS_KEY_TYPE,
  RELATIONSHIP_ARTIFACT_REGISTRY_REPOSITORY_USES_PACKAGE_TYPE,
  RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_TYPE,
  RELATIONSHIP_TYPE_PROJECT_ASSIGNED_ARTIFACT_REGISTRY_VPCSC_Policy,
  RELATIONSHIP_TYPE_PROJECT_USES_ARTIFACT_REGISTRY_VPCSC_CONFIG,
  STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_KMS_KEY_RELATIONSHIP,
  STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_NPM_PACKAGE_RELATIONSHIP,
  STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_PACKAGE_RELATIONSHIP,
  STEP_ARTIFACT_REPOSITROY_PACKAGE_IS_NPM_PACKAGE_RELATIONSHIP,
  STEP_PROJECT_ASSIGNED_ARTIFACT_REGISTRY_VPCSC_POLICY_RELATIONSHIP,
  STEP_PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP,
  STEP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP,
  STEP_PROJECT_USES_ARTIFACT_REGISTRY_VPCSC_CONFIG_RELATIONSHIP,
} from './constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import { integrationConfig } from '../../../test/config';
import {
  buildArtifactRegistryRepositoryUsesKMSKeysRelationship,
  buildArtifactRegistryRepositoryUsesPackageRelationship,
  buildProjectAssignedVpcscPolicyRelationship,
  buildProjectHasArtifactRegistryRelationship,
  buildProjectHasArtifactRegistryRepositoryRelationship,
  buildProjectUsesVpcscConfigRelationship,
  fetchArtifactRegistry,
  fetchArtifactRegistryRepository,
  fetchArtifactRegistryVPCSCs,
  fetchArtifactRepositoryPackage,
} from '.';
import {
  PROJECT_ENTITY_TYPE,
  fetchResourceManagerProject,
} from '../resource-manager';
import { ENTITY_TYPE_KMS_KEY, fetchKmsCryptoKeys } from '../kms';
import { invocationConfig } from '../..';

describe(`artifactRegistry#${STEP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
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
    await fetchArtifactRegistryRepository(context);
    await fetchResourceManagerProject(context);
    await buildProjectHasArtifactRegistryRepositoryRelationship(context);
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
        (e) => e._type === ARTIFACT_REGISTRY_REPOSITORY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ARTIFACT_REGISTRY_REPOSITORY_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ARTIFACT_REGISTRY_REPOSITORY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          projectId: { type: 'string' },
          createdTime: { type: 'string' },
          updatedTime: { type: 'string' },
          format: { type: 'string' },
          mode: { type: 'string' },
          kmsKey: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_TYPE,
          },
        },
      },
    });
  }, 100000);
});

describe(`artifactRegistry#${STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_KMS_KEY_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_KMS_KEY_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
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
    await fetchArtifactRegistryRepository(context);
    await fetchKmsCryptoKeys(context);
    await buildArtifactRegistryRepositoryUsesKMSKeysRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_KMS_KEY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Key', 'CryptoKey'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_kms_crypto_key' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          createdOn: { type: 'number' },
          purpose: { type: 'string' },
          nextRotationTime: { type: 'number' },
          rotationPeriod: { type: 'number' },
          protectionLevel: { type: 'string' },
          algorithm: { type: 'string' },
          public: { type: 'boolean' },
          primaryName: { type: 'string' },
          primaryState: { type: 'string' },
          primaryCreateTime: { type: 'number' },
          primaryProtectionLevel: { type: 'string' },
          primaryAlgorithm: { type: 'string' },
          primaryGenerateTime: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ARTIFACT_REGISTRY_REPOSITORY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ARTIFACT_REGISTRY_REPOSITORY_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ARTIFACT_REGISTRY_REPOSITORY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          projectId: { type: 'string' },
          createdTime: { type: 'string' },
          updatedTime: { type: 'string' },
          format: { type: 'string' },
          mode: { type: 'string' },
          kmsKey: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_ARTIFACT_REGISTRY_REPOSITORY_USES_KMS_KEY_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: RELATIONSHIP_ARTIFACT_REGISTRY_REPOSITORY_USES_KMS_KEY_TYPE,
          },
        },
      },
    });
  }, 100000);
});

describe(`artifactRegistry#${STEP_PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
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
    await fetchArtifactRegistry(context);
    await fetchResourceManagerProject(context);
    await buildProjectHasArtifactRegistryRelationship(context);
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
        (e) => e._type === ARTIFACT_REGISTRY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ARTIFACT_REGISTRY_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ARTIFACT_REGISTRY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          function: { type: 'array' },
          category: { type: 'array' },
          endpoint: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_TYPE,
          },
        },
      },
    });
  });
});

describe(`artifactRegistry#${STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_PACKAGE_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_PACKAGE_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
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
    await fetchArtifactRegistryRepository(context);
    await fetchArtifactRepositoryPackage(context);
    await buildArtifactRegistryRepositoryUsesPackageRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ARTIFACT_REPOSITORY_PACKAGE_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['CodeModule'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_artifact_registry_package' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          createdTime: { type: 'string' },
          updatedTime: { type: 'string' },
          repositoryName: { type: 'string' },
          isNPMPackage: { type: 'boolean' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ARTIFACT_REGISTRY_REPOSITORY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ARTIFACT_REGISTRY_REPOSITORY_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ARTIFACT_REGISTRY_REPOSITORY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          projectId: { type: 'string' },
          createdTime: { type: 'string' },
          updatedTime: { type: 'string' },
          format: { type: 'string' },
          mode: { type: 'string' },
          kmsKey: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_ARTIFACT_REGISTRY_REPOSITORY_USES_PACKAGE_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: RELATIONSHIP_ARTIFACT_REGISTRY_REPOSITORY_USES_PACKAGE_TYPE,
          },
        },
      },
    });
  }, 100000);
});

describe(`artifactRegistry#${STEP_ARTIFACT_REPOSITROY_PACKAGE_IS_NPM_PACKAGE_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_ARTIFACT_REPOSITROY_PACKAGE_IS_NPM_PACKAGE_RELATIONSHIP,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_ARTIFACT_REPOSITROY_PACKAGE_IS_NPM_PACKAGE_RELATIONSHIP,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_ARTIFACT_REPOSITROY_PACKAGE_IS_NPM_PACKAGE_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toHaveOnlyMappedRelationships; //.toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`artifactRegistry#${STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_NPM_PACKAGE_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_NPM_PACKAGE_RELATIONSHIP,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_NPM_PACKAGE_RELATIONSHIP,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_ARTIFACT_REGISTRY_REPOSITORY_USES_NPM_PACKAGE_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toHaveOnlyMappedRelationships;
    },
    500_000,
  );
});

describe(`artifactRegistry#${STEP_PROJECT_ASSIGNED_ARTIFACT_REGISTRY_VPCSC_POLICY_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_ASSIGNED_ARTIFACT_REGISTRY_VPCSC_POLICY_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test(
    STEP_PROJECT_ASSIGNED_ARTIFACT_REGISTRY_VPCSC_POLICY_RELATIONSHIP,
    async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: {
          ...integrationConfig,
          serviceAccountKeyFile:
            integrationConfig.serviceAccountKeyFile.replace(
              'j1-gc-integration-dev-v2',
              'j1-gc-integration-dev-v3',
            ),
          serviceAccountKeyConfig: {
            ...integrationConfig.serviceAccountKeyConfig,
            project_id: 'j1-gc-integration-dev-v3',
          },
        },
      });

      await fetchArtifactRegistryVPCSCs(context);
      await fetchResourceManagerProject(context);
      await buildProjectAssignedVpcscPolicyRelationship(context);
      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships:
          context.jobState.collectedRelationships.length,
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
          (e) => e._type === ARTIFACT_REGISTRY_VPCSC_POLICY_TYPE,
        ),
      ).toMatchGraphObjectSchema({
        _class: ARTIFACT_REGISTRY_VPCSC_POLICY_CLASS,
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: ARTIFACT_REGISTRY_VPCSC_POLICY_TYPE },
            _rawData: {
              type: 'array',
              items: { type: 'object' },
            },
            name: { type: 'string' },
            VPCSCPolicy: { type: 'string' },
            projectId: { type: 'string' },
          },
        },
      });
      const { directRelationships } = separateRelationships(
        context.jobState.collectedRelationships,
      );
      expect(
        directRelationships.filter(
          (e) =>
            e._type ===
            RELATIONSHIP_TYPE_PROJECT_ASSIGNED_ARTIFACT_REGISTRY_VPCSC_Policy,
        ),
      ).toMatchDirectRelationshipSchema({
        schema: {
          properties: {
            _class: { const: 'ASSIGNED' },
            _type: {
              const:
                RELATIONSHIP_TYPE_PROJECT_ASSIGNED_ARTIFACT_REGISTRY_VPCSC_Policy,
            },
          },
        },
      });
    },
    100000,
  );
});

describe(`artifactRegistry#${STEP_PROJECT_USES_ARTIFACT_REGISTRY_VPCSC_CONFIG_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_USES_ARTIFACT_REGISTRY_VPCSC_CONFIG_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test(
    STEP_PROJECT_USES_ARTIFACT_REGISTRY_VPCSC_CONFIG_RELATIONSHIP,
    async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: {
          ...integrationConfig,
          serviceAccountKeyFile:
            integrationConfig.serviceAccountKeyFile.replace(
              'j1-gc-integration-dev-v2',
              'j1-gc-integration-dev-v3',
            ),
          serviceAccountKeyConfig: {
            ...integrationConfig.serviceAccountKeyConfig,
            project_id: 'j1-gc-integration-dev-v3',
          },
        },
      });

      await fetchArtifactRegistryVPCSCs(context);
      await fetchResourceManagerProject(context);
      await buildProjectUsesVpcscConfigRelationship(context);
      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships:
          context.jobState.collectedRelationships.length,
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
          (e) => e._type === ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_TYPE,
        ),
      ).toMatchGraphObjectSchema({
        _class: ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_CLASS,
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_TYPE },
            _rawData: {
              type: 'array',
              items: { type: 'object' },
            },
            name: { type: 'string' },
            VPCSCPolicy: { type: 'string' },
            projectId: { type: 'string' },
          },
        },
      });
      const { directRelationships } = separateRelationships(
        context.jobState.collectedRelationships,
      );
      expect(
        directRelationships.filter(
          (e) =>
            e._type ===
            RELATIONSHIP_TYPE_PROJECT_USES_ARTIFACT_REGISTRY_VPCSC_CONFIG,
        ),
      ).toMatchDirectRelationshipSchema({
        schema: {
          properties: {
            _class: { const: 'USES' },
            _type: {
              const:
                RELATIONSHIP_TYPE_PROJECT_USES_ARTIFACT_REGISTRY_VPCSC_CONFIG,
            },
          },
        },
      });
    },
    100000,
  );
});
