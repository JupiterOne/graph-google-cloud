import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { binaryauthorization_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  BINARY_AUTHORIZATION_POLICY_ENTITY_CLASS,
  BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
} from './constants';

export function createBinaryAuthorizationPolicyEntity(
  data: binaryauthorization_v1.Schema$Policy,
  projectId: string,
) {
  const admissionWhitelistPatternsSrc: binaryauthorization_v1.Schema$AdmissionWhitelistPattern[] =
    data.admissionWhitelistPatterns || [];

  const admissionWhitelistPatterns: string[] = admissionWhitelistPatternsSrc
    .map(
      (pattern: binaryauthorization_v1.Schema$AdmissionWhitelistPattern) =>
        pattern.namePattern || '',
    )
    .filter((value) => value);

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
        _class: BINARY_AUTHORIZATION_POLICY_ENTITY_CLASS,
        name: data.name,
        // 6.1.4 Minimize Container Registries to only those approved (Not Scored)
        admissionWhitelistPatterns: admissionWhitelistPatterns,
        evaluationMode: data.defaultAdmissionRule?.evaluationMode,
        globalPolicyEvaluationMode: data.globalPolicyEvaluationMode,
        webLink: getGoogleCloudConsoleWebLink(
          `/security/binary-authorization/policy?project=${projectId}&folder=&organizationId=`,
        ),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}
