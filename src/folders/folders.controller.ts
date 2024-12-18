import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  UseGuards,
  Param,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { File } from 'src/files/schemas/file.schema';
import { ApiTags, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PermissionsGuard } from 'src/permission/permission.guard';
import { ResourceType } from 'src/decorators/resource.decorator';

@ApiTags('folders')
@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly folderService: FoldersService) {}

  @Post()
  @ApiBody({
    description: 'Create a new folder.',
    type: CreateFolderDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully.',
    schema: {
      example: {
        id: 'folder123',
        name: 'New Folder',
        owner: 'user123',
        parentFolderId: null,
        files: [],
        subFolders: [],
      },
    },
  })
  async createFolder(@Body() body: CreateFolderDto, @Req() req) {
    const userId = req.user.id;
    return this.folderService.createFolder({ ...body, owner: userId });
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns all folders for the authenticated user.',
    schema: {
      example: [
        {
          id: 'folder123',
          name: 'Folder 1',
          owner: 'user123',
          parentFolderId: null,
          files: [],
          subFolders: [],
        },
        {
          id: 'folder456',
          name: 'Folder 2',
          owner: 'user123',
          parentFolderId: 'folder123',
          files: [],
          subFolders: [],
        },
      ],
    },
  })
  async getUserFolders(@Req() req) {
    const userId = req.user.id;
    return this.folderService.getUserFolders(userId);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @ResourceType('folder')
  @ApiParam({
    name: 'id',
    description: 'The ID of the folder to retrieve.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the specified folder and its contents.',
    schema: {
      example: {
        id: 'folder123',
        name: 'Folder 1',
        owner: 'user123',
        parentFolderId: null,
        files: ['file123', 'file456'],
        subFolders: ['folder456'],
      },
    },
  })
  async getFolderById(@Param('id') folderId: string) {
    return this.folderService.getFolderById(folderId);
  }

  @Post(':id/files')
  @ApiParam({
    name: 'id',
    description: 'The ID of the folder to add a file to.',
  })
  @ApiBody({
    description: 'The file to upload.',
    schema: {
      example: {
        file: '<binary file>',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File added to folder successfully.',
    schema: {
      example: {
        id: 'folder123',
        name: 'Folder 1',
        files: ['file123', 'file456', 'newFile789'],
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
  async addFileToFolder(
    @Param('id') folderId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.id;

    const fileData = {
      name: file.originalname,
      fileType: file.mimetype,
      size: file.size,
      path: `uploads/${file.filename}`,
    };

    return this.folderService.addFileToFolder(
      folderId,
      userId,
      fileData as File,
    );
  }

  @Post(':id/subfolders')
  @ApiParam({
    name: 'id',
    description: 'The ID of the folder to add a subfolder to.',
  })
  @ApiBody({
    description: 'Details of the new subfolder.',
    type: CreateFolderDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Subfolder added successfully.',
    schema: {
      example: {
        id: 'folder123',
        name: 'Folder 1',
        subFolders: ['subfolder789'],
      },
    },
  })
  async addSubFolderToFolder(
    @Param('id') folderId: string,
    @Body() createFolderDto: CreateFolderDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.folderService.addSubFolderToFolder(folderId, {
      ...createFolderDto,
      owner: userId,
    });
  }

  @Patch(':id/rename')
  @ApiParam({
    name: 'id',
    description: 'The ID of the folder to rename.',
  })
  @ApiBody({
    description: 'The new name of the folder.',
    schema: {
      example: { name: 'New Folder Name' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Folder renamed successfully.',
    schema: {
      example: {
        id: 'folder123',
        name: 'New Folder Name',
        owner: 'user123',
      },
    },
  })
  async updateFolder(
    @Param('id') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.folderService.updateFolder(folderId, updateFolderDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the folder to delete.',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder and its contents deleted successfully.',
    schema: {
      example: { message: 'Folder deleted successfully.' },
    },
  })
  async deleteFolder(@Param('id') folderId: string) {
    return this.folderService.deleteFolder(folderId);
  }

  @Put(':id/visibility')
  async changeFolderVisibility(
    @Param('id') folderId: string,
    @Body('isPublic') isPublic: boolean,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.folderService.changeFolderVisibility(
      folderId,
      userId,
      isPublic,
    );
  }

  @Put(':id/permissions')
  async updateFolderPermissions(
    @Param('id') folderId: string,
    @Body('permissions')
    permissions: { email: string; role: 'viewer' | 'editor' }[],
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.folderService.updateFolderPermissions(
      folderId,
      userId,
      permissions,
    );
  }
}
