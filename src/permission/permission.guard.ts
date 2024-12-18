import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FoldersService } from 'src/folders/folders.service';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(forwardRef(() => FoldersService))
    private readonly foldersService: FoldersService,
    @Inject(forwardRef(() => FilesService))
    private readonly filesService: FilesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;
    const resourceType = this.reflector.get<string>(
      'resourceType',
      context.getHandler(),
    );

    if (!user) throw new ForbiddenException('User not authenticated');

    let resource;

    if (resourceType === 'folder') {
      resource = await this.foldersService.getFolderById(resourceId);
    } else if (resourceType === 'file') {
      resource = await this.filesService.getFileById(resourceId);
    }

    if (!resource) throw new ForbiddenException('Resource not found');

    const hasAccess = this.checkPermissions(user, resource);
    if (!hasAccess) throw new ForbiddenException('Access denied');

    return true;
  }

  private checkPermissions(user, resource): boolean {
    if (resource.owner === user.id) return true;
    if (resource.isPublic) return true;

    const sharedUser = resource.sharedWith.find(
      (perm) => perm.email === user.email,
    );

    return !!sharedUser;
  }
}
