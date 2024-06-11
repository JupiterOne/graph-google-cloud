export const STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY = 'fetch-policy-intelligence-analyzer-activity';
export const POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_CLASS = ['Assessment'];
export const POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE = 'google_cloud_policy_intelligence_analyzer_activity';

export const STEP_POLICY_INTELLIGENCE_ANALYZER = 'fetch-policy-intelligence-analyzer';
export const POLICY_INTELLIGENCE_ANALYZER_CLASS = ['Service'];
export const POLICY_INTELLIGENCE_ANALYZER_TYPE = 'google_cloud_policy_intelligence_analyzer';

export const STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY =
  'fetch-project-has-policy-intelligence-analyzer-activity-relation';
export const RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY =
  'google_cloud_project_has_policy_intelligence_analyzer_activity';


export const STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY =
  'fetch-policy-intelligence-analyzer-has-policy-intelligence-analyzer-activity-relation';
export const RELATIONSHIP_TYPE_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY =
  'google_cloud_policy_intelligence_analyzer_has_activity';

export const STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER =
  'fetch-project-has-policy-intelligence-analyzer-relation';
export const RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER =
  'google_cloud_project_has_policy_intelligence_analyzer';

export const IngestionSources = {
  POLICY_INTELLIGENCE_ANALYZER_ACTIVITY: 'policy-intelligence-analyzer-activity',
  PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY: 'project-has-policy-intelligence-analyzer-activity-relation',
  POLICY_INTELLIGENCE_ANALYZER: 'policy-intelligence-analyzer',
  PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER: 'project-has-policy-intelligence-analyzer-relation',
  POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY: 'policy-intelligence-analyzer-has-policy-intelligence-analyzer-activity-relation',
};

export const PolicyIntelligenceIngestionConfig = {
  [IngestionSources.POLICY_INTELLIGENCE_ANALYZER_ACTIVITY]: {
    title: 'Policy Intelligence Analyzer Activity',
    description: 'Analyzes activity for Policy Intelligence.',
    defaultsToDisabled: false,
  },
  [IngestionSources.PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY]: {
    title: 'Project has Policy Intelligence Analyzer Activity Relation',
    description: 'Relation indicating project has Policy Intelligence Analyzer activity.',
    defaultsToDisabled: false,
  },
  [IngestionSources.POLICY_INTELLIGENCE_ANALYZER]: {
    title: 'Policy Intelligence Analyzer',
    description: 'Analyzes policies',
    defaultsToDisabled: false,
  },
  [IngestionSources.PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER]: {
    title: 'Project has Policy Intelligence Analyzer Relation',
    description: 'Relation indicating project has Policy Intelligence Analyzer.',
    defaultsToDisabled: false,
  },
  [IngestionSources.POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY]: {
    title: 'Policy Intelligence Analyzer has Policy Intelligence Analyzer Activity Relation',
    description: 'Relation indicating Policy Intelligence Analyzer has Policy Intelligence Analyzer activity.',
    defaultsToDisabled: false,
  },
};

export const PolicyIntelligencePermissions = {
  STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY: ['policyanalyzer.serviceAccountKeyLastAuthenticationActivities.query',
    'policyanalyzer.serviceAccountLastAuthenticationActivities.query'],
  STEP_POLICY_INTELLIGENCE_ANALYZER: ['dns.policies.list'],
};
