import { SetMetadata } from '@nestjs/common';

export const ResourceType = (type: 'folder' | 'file') =>
  SetMetadata('resourceType', type);
