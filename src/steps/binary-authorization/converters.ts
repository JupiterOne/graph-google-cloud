import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { binaryauthorization_v1 } from 'googleapis';
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

  return createIntegrationEntity({
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
        title: 'Binary Authorization Policy',
        summary:
          'Binary Authorization implements a policy model, where a policy is a set of rules that governs the deployment of container images to a GKE cluster. Rules in a policy provide specific criteria that an image must satisfy before it can be deployed.',
        content: '',
        webLink: getGoogleCloudConsoleWebLink(
          `/security/binary-authorization/policy?project=${projectId}&folder=&organizationId=`,
        ),
      },
    },
  });
}
