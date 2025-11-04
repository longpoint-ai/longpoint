import { SupportedMimeType } from '@longpoint/types';

export interface CreateMediaContainerParams {
  path: string;
  name?: string;
  mimeType: SupportedMimeType;
  classifiersOnUpload?: string[];
  uploadToken?: {
    token: string;
    expiresAt: Date;
  };
}
