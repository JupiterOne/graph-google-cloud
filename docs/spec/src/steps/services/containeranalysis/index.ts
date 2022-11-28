import {
  IntegrationInstanceConfig,
  RelationshipClass,
  StepSpec,
} from '@jupiterone/integration-sdk-core';

export const containeranalysisSteps: StepSpec<IntegrationInstanceConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.google.com/container-analysis/docs/reference/rest/v1/projects.notes/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: projects.notes.list
     */
    id: 'fetch-container-analysis-notes',
    name: 'Fetch Container Analysis Notes',
    entities: [
      {
        resourceName: 'Container Analysis Note',
        _type: 'google_cloud_project_container_analysis_note',
        _class: ['Assessment'],
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: https://cloud.google.com/container-analysis/docs/reference/rest/v1/projects.occurrences/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: projects.notes.occurrences.list
     */
    id: 'fetch-container-analysis-occurrences',
    name: 'Fetch Container Analysis Occurrences',
    entities: [
      {
        resourceName: 'Container Analysis Occurrence',
        _type: 'google_cloud_container_analysis_occurrence',
        _class: ['Finding'],
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
  {
    /**
     * PROPERTY: projects.noteOccurrences
     * PATTERN: Build Child Relationships
     * REQUIRED PERMISSIONS: n/a
     */
    id: 'build-container-analysis-note-occurrences-relationships',
    name: 'Build Container Analysis Note -> Occurrence',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_container_analysis_note_has_ocurrence',
        _class: RelationshipClass.HAS,
        sourceType: 'google_cloud_project_container_analysis_note',
        targetType: 'google_cloud_container_analysis_occurrence',
      },
    ],
    dependsOn: [
      'fetch-container-analysis-project-notes',
      'fetch-container-analysis-project-occurrences',
    ],
    implemented: false,
  },
];
