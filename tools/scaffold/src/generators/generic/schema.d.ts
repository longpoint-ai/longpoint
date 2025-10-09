export interface GenericGeneratorSchema {
  scope: 'api' | 'web' | 'shared';
  name: string;
  pluralName?: string;
  includeTests?: boolean;
}
