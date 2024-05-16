import {
    executeStepWithDependencies,
    Recording,
    StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { invocationConfig } from '../..';
import { setupGoogleCloudRecording, getMatchRequestsBy } from '../../../test/recording';
import {
    STEP_CLOUD_SQL,
    STEP_CLOUD_SQL_BACKUP,
    STEP_CLOUD_SQL_CONNECTION,
    STEP_CLOUD_SQL_DATABASE,
    STEP_CLOUD_SQL_INSTANCES,
    STEP_CLOUD_SQL_SSL_CERTIFICATION,
    STEP_CLOUD_USER,
} from './constants';

describe(`Cloud-Sql#${STEP_CLOUD_SQL}`, () => {
    let recording: Recording;
    afterEach(async () => {
        if (recording) await recording.stop();
    });

    test(STEP_CLOUD_SQL, async () => {
        recording = setupGoogleCloudRecording({
            name: STEP_CLOUD_SQL,
            directory: __dirname,
            options: {
                matchRequestsBy: getMatchRequestsBy(integrationConfig),
                recordFailedRequests: true,
            },
        });

        const stepTestConfig: StepTestConfig = {
            stepId: STEP_CLOUD_SQL,
            instanceConfig: integrationConfig,
            invocationConfig: invocationConfig as any,
        };

        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
    });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_BACKUP}`, () => {
    let recording: Recording;
    afterEach(async () => {
        if (recording) await recording.stop();
    });

    test(STEP_CLOUD_SQL_BACKUP, async () => {
        recording = setupGoogleCloudRecording({
            name: STEP_CLOUD_SQL_BACKUP,
            directory: __dirname,
            options: {
                matchRequestsBy: getMatchRequestsBy(integrationConfig),
                recordFailedRequests: true,
            },
        });

        const stepTestConfig: StepTestConfig = {
            stepId: STEP_CLOUD_SQL_BACKUP,
            instanceConfig: integrationConfig,
            invocationConfig: invocationConfig as any,
        };

        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
    });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_CONNECTION}`, () => {
    let recording: Recording;
    afterEach(async () => {
        if (recording) await recording.stop();
    });

    test(STEP_CLOUD_SQL, async () => {
        recording = setupGoogleCloudRecording({
            name: STEP_CLOUD_SQL,
            directory: __dirname,
            options: {
                matchRequestsBy: getMatchRequestsBy(integrationConfig),
                recordFailedRequests: true,
            },
        });

        const stepTestConfig: StepTestConfig = {
            stepId: STEP_CLOUD_SQL,
            instanceConfig: integrationConfig,
            invocationConfig: invocationConfig as any,
        };

        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
    });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_DATABASE}`, () => {
    let recording: Recording;
    afterEach(async () => {
        if (recording) await recording.stop();
    });

    test(STEP_CLOUD_SQL_DATABASE, async () => {
        recording = setupGoogleCloudRecording({
            name: STEP_CLOUD_SQL_DATABASE,
            directory: __dirname,
            options: {
                matchRequestsBy: getMatchRequestsBy(integrationConfig),
                recordFailedRequests: true,
            },
        });

        const stepTestConfig: StepTestConfig = {
            stepId: STEP_CLOUD_SQL_DATABASE,
            instanceConfig: integrationConfig,
            invocationConfig: invocationConfig as any,
        };

        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
    });
});

describe(`Cloud-Sql#${STEP_CLOUD_USER}`, () => {
    let recording: Recording;
    afterEach(async () => {
        if (recording) await recording.stop();
    });

    test(STEP_CLOUD_USER, async () => {
        recording = setupGoogleCloudRecording({
            name: STEP_CLOUD_USER,
            directory: __dirname,
            options: {
                matchRequestsBy: getMatchRequestsBy(integrationConfig),
                recordFailedRequests: true,
            },
        });

        const stepTestConfig: StepTestConfig = {
            stepId: STEP_CLOUD_USER,
            instanceConfig: integrationConfig,
            invocationConfig: invocationConfig as any,
        };

        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
    });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_SSL_CERTIFICATION}`, () => {
    let recording: Recording;
    afterEach(async () => {
        if (recording) await recording.stop();
    });

    test(STEP_CLOUD_SQL_SSL_CERTIFICATION, async () => {
        recording = setupGoogleCloudRecording({
            name: STEP_CLOUD_SQL_SSL_CERTIFICATION,
            directory: __dirname,
            options: {
                matchRequestsBy: getMatchRequestsBy(integrationConfig),
                recordFailedRequests: true,
            },
        });

        const stepTestConfig: StepTestConfig = {
            stepId: STEP_CLOUD_SQL_SSL_CERTIFICATION,
            instanceConfig: integrationConfig,
            invocationConfig: invocationConfig as any,
        };

        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
    });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES}`, () => {
    let recording: Recording;
    afterEach(async () => {
        if (recording) await recording.stop();
    });

    test(STEP_CLOUD_SQL_INSTANCES, async () => {
        recording = setupGoogleCloudRecording({
            name: STEP_CLOUD_SQL_INSTANCES,
            directory: __dirname,
            options: {
                matchRequestsBy: getMatchRequestsBy(integrationConfig),
                recordFailedRequests: true,
            },
        });

        const stepTestConfig: StepTestConfig = {
            stepId: STEP_CLOUD_SQL_INSTANCES,
            instanceConfig: integrationConfig,
            invocationConfig: invocationConfig as any,
        };

        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
    });
});
