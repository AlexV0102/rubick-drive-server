import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionsGuard } from 'src/permission/permission.guard';
import { ResourceType } from 'src/decorators/resource.decorator';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiBody({
    description: 'Upload a file to a folder.',
    schema: {
      example: {
        folderId: '12345',
        isPublic: true,
        file: '<binary file>',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully.',
    schema: {
      example: {
        id: 'file123',
        name: 'example.txt',
        fileType: 'text/plain',
        size: 1024,
        folderId: '12345',
        isPublic: false,
        path: '/uploads/example.txt',
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadFile(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: { folderId?: string; isPublic?: boolean },
  ) {
    const userId = req.user.id;
    return this.filesService.uploadFile(
      {
        name: file.originalname,
        fileType: file.mimetype,
        size: file.size,
        folderId: uploadFileDto.folderId,
        path: file.path,
        isPublic: uploadFileDto.isPublic || false,
      },
      userId,
    );
  }

  @Put(':id/permissions')
  @ApiParam({
    name: 'id',
    description: 'The ID of the file to update permissions for.',
  })
  @ApiBody({
    description: 'Array of user permissions to assign to the file.',
    schema: {
      example: [
        { email: 'user1@example.com', role: 'viewer' },
        { email: 'user2@example.com', role: 'editor' },
      ],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated successfully.',
    schema: {
      example: {
        id: 'file123',
        sharedWith: [
          { email: 'user1@example.com', role: 'viewer' },
          { email: 'user2@example.com', role: 'editor' },
        ],
      },
    },
  })
  async updatePermissions(
    @Param('id') fileId: string,
    @Body('permissions')
    permissions: { email: string; role: 'viewer' | 'editor' }[],
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.filesService.updateFilePermissions(fileId, permissions, userId);
  }

  @Post(':id/clone')
  @ApiParam({ name: 'id', description: 'The ID of the file to clone.' })
  @ApiResponse({
    status: 201,
    description: 'File cloned successfully.',
    schema: {
      example: {
        id: 'newFile123',
        name: 'copy_example.txt',
        fileType: 'text/plain',
        size: 1024,
        path: '/uploads/copy_example.txt',
      },
    },
  })
  async cloneFile(@Param('id') fileId: string) {
    return this.filesService.cloneFile(fileId);
  }

  @Get()
  @ApiQuery({
    name: 'folderId',
    required: false,
    description: 'ID of the folder to fetch files for.',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of files in the specified folder (or all files if no folderId is provided).',
    schema: {
      example: [
        {
          id: 'file123',
          name: 'example.txt',
          fileType: 'text/plain',
          size: 1024,
          folderId: '12345',
          isPublic: false,
          path: '/uploads/example.txt',
        },
      ],
    },
  })
  getFiles(@Req() req, @Query('folderId') folderId?: string) {
    const userId = req.user.id;
    return this.filesService.getFiles(userId, folderId);
  }

  @Get(':id/user')
  @UseGuards(PermissionsGuard)
  @ResourceType('file')
  @ApiParam({ name: 'id', description: 'User ID to fetch file for.' })
  @ApiResponse({
    status: 200,
    description: 'List of files owned by the specified user.',
    schema: {
      example: [
        {
          id: 'file123',
          name: 'example.txt',
          fileType: 'text/plain',
          size: 1024,
          folderId: '12345',
          isPublic: false,
          path: '/uploads/example.txt',
        },
      ],
    },
  })
  getFilesByUserId(@Param('id') userId: string) {
    return this.filesService.getUserFiles(userId);
  }

  @Get(':id/serve')
  @UseGuards(PermissionsGuard)
  @ResourceType('file')
  @ApiParam({ name: 'id', description: 'File ID to serve.' })
  @ApiResponse({
    status: 200,
    description: 'Serves the requested file.',
    schema: { example: '<binary file>' },
  })
  async serveFile(
    @Param('id') fileId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getFile(fileId);

    const filePath = join(process.cwd(), file.path);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
    res.sendFile(filePath);
  }

  @Get(':id/metadata')
  @UseGuards(PermissionsGuard)
  @ResourceType('file')
  @ApiParam({ name: 'id', description: 'File ID to fetch metadata for.' })
  @ApiResponse({
    status: 200,
    description: 'Returns metadata for the specified file.',
    schema: {
      example: {
        id: 'file123',
        name: 'example.txt',
        fileType: 'text/plain',
        size: 1024,
        folderId: '12345',
        isPublic: false,
        path: '/uploads/example.txt',
        sharedWith: [
          { email: 'user1@example.com', role: 'viewer' },
          { email: 'user2@example.com', role: 'editor' },
        ],
      },
    },
  })
  async getFileMetadata(@Param('id') fileId: string) {
    return this.filesService.getFile(fileId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'File ID to delete.' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully.',
    schema: { example: { message: 'File deleted successfully.' } },
  })
  async deleteFile(@Param('id') fileId: string, @Req() req: any) {
    const userId = req.user.id;
    await this.filesService.deleteFile(fileId, userId);
    return { message: 'File deleted successfully.' };
  }
  @Put(':id/rename')
  @ApiParam({ name: 'id', description: 'File ID to rename.' })
  @ApiBody({
    description: 'New name for the file.',
    schema: { example: { name: 'new_example.txt' } },
  })
  @ApiResponse({
    status: 200,
    description: 'File renamed successfully.',
    schema: {
      example: {
        id: 'file123',
        name: 'new_example.txt',
        fileType: 'text/plain',
        size: 1024,
        folderId: '12345',
        isPublic: false,
        path: '/uploads/new_example.txt',
      },
    },
  })
  async updateFile(
    @Param('id') fileId: string,
    @Body() updateFileDto: { name: string },
  ) {
    return this.filesService.updateFile(fileId, updateFileDto.name);
  }

  @Put(':id/visibility')
  async changeFileVisibility(
    @Param('id') fileId: string,
    @Body('isPublic') isPublic: boolean,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.filesService.changeFileVisibility(fileId, userId, isPublic);
  }
}
