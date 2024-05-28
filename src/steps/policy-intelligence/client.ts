import { google, policyanalyzer_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
    PolicyIntelligencePermissions,
    STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY
} from './constants';
import { googleCloudRegions } from '../../google-cloud/regions';

export class PolicyAnalyzerClient extends Client {
    private client = google.policyanalyzer({ version: 'v1', retry: false });

    async iteratePolicyAnalyzerActivity(
        callback: (data: policyanalyzer_v1.Schema$GoogleCloudPolicyanalyzerV1Activity) => Promise<void>,
    ) {
        const auth = await this.getAuthenticatedServiceClient();

        // Iterate over each region
        for (const region of googleCloudRegions) {
            await this.iterateApi(
                async (nextPageToken) => {
                    return this.client.projects.locations.activityTypes.activities.query({
                        parent: `projects/${this.projectId}/locations/${region.name}/activityTypes/serviceAccountLastAuthentication`,
                        auth,
                        pageToken: nextPageToken,
                    });
                },
                async (data: policyanalyzer_v1.Schema$GoogleCloudPolicyanalyzerV1QueryActivityResponse) => {
                    for (const activity of data.activities || []) {
                        await callback(activity);
                    }
                },
                STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
                PolicyIntelligencePermissions.STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
            );
        }
    }
}
