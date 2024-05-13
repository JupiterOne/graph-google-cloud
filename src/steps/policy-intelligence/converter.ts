import { policyanalyzer_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
    POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_CLASS,
    POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
    POLICY_INTELLIGENCE_ANALYZER_CLASS,
    POLICY_INTELLIGENCE_ANALYZER_TYPE,
} from './constants';

export function createPolicyIntelligenceAnalyzerActivityEntity(data: policyanalyzer_v1.Schema$GoogleCloudPolicyanalyzerV1Activity) {
    return createGoogleCloudIntegrationEntity(data, {
        entityData: {
            source: data,
            assign: {
                _key: data.fullResourceName as string,
                _type: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
                _class: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_CLASS,
                name: data.fullResourceName,
                summary: 'policy activities on Google Cloud resources',
                category: data.activityType as string,
                internal: true,
                serviceAccountId: data.activity?.serviceAccount.serviceAccountId,
                endTime: data.observationPeriod?.endTime,
                startTime: data.observationPeriod?.startTime
            },
        },
    });
}

export function createPolicyIntelligenceAnalyzerEntity(
    data,
    projectId: string,
) {
    return createGoogleCloudIntegrationEntity(data, {
        entityData: {
            source: data,
            assign: {
                _key: data.serviceAccountId as string,
                _type: POLICY_INTELLIGENCE_ANALYZER_TYPE,
                _class: POLICY_INTELLIGENCE_ANALYZER_CLASS,
                name: data.name,
                category: ['network'],
                function: ['monitoring', 'networking'],
                projectId: projectId,
                activityType: data.activityType,
                observationPeriod: data.observationPeriod
            },
        },
    });
}