import { GoogleCloudIntegrationStep } from '../../types';
import { alloyDBPostgreSQLBackupStep } from './steps/alloydb-postgre-sql-backup';
import { alloyDBPostgreSQLClusterStep } from './steps/alloydb-postgre-sql-cluster';
import { alloyDBPostgreSQLConnectionStep } from './steps/alloydb-postgre-sql-connection';
import { alloyDBPostgreSQLInstanceStep } from './steps/alloydb-postgre-sql-instance';
import { alloyDBPostgreSQLServiceStep } from './steps/alloydb-service';
import { buildAlloyDBClusterHasBackupRelationshipStep } from './steps/build-alloydb-cluster-has-backup';
import { buildAlloyDBClusterUsesKMSKeyRelationshipStep } from './steps/build-alloydb-cluster-uses-ksm-key';
import { buildAlloyDBInstanceHasConnectionRelationshipStep } from './steps/build-alloydb-instance-has-connection';
import { buildInstanceClusterRelationshipStep } from './steps/build-alloydb-instance-uses-cluster-relationship';
import { buildProjectAlloyDBServiceRelationshipStep } from './steps/build-project-has-alloydb-service-relationship';
import { buildProjectClusterRelationshipStep } from './steps/build-project-has-cluster';
import { buildUserAssignedAlloyDbClusterRelationshipStep } from './steps/build-user-assigned-alloydb-cluster';

export const alloyDBSteps: GoogleCloudIntegrationStep[] = [
  alloyDBPostgreSQLServiceStep,
  alloyDBPostgreSQLClusterStep,
  alloyDBPostgreSQLInstanceStep,
  alloyDBPostgreSQLConnectionStep,
  alloyDBPostgreSQLBackupStep,
  buildProjectAlloyDBServiceRelationshipStep,
  buildProjectClusterRelationshipStep,
  buildInstanceClusterRelationshipStep,
  buildAlloyDBClusterHasBackupRelationshipStep,
  buildAlloyDBInstanceHasConnectionRelationshipStep,
  buildAlloyDBClusterUsesKMSKeyRelationshipStep,
  buildUserAssignedAlloyDbClusterRelationshipStep,
];
