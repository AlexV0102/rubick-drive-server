import { SetMetadata } from '@nestjs/common';

// This decorator sets a metadata key 'resourceType' with the provided type
export const ResourceType = (type: 'folder' | 'file') =>
  SetMetadata('resourceType', type);
