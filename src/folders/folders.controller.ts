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
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { File } from 'src/files/schemas/file.schema';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly folderService: FoldersService) {}

  @Post()
  async createFolder(@Body() body, @Req() req) {
    const userId = req.user.id;
    return this.folderService.createFolder({ ...body, owner: userId });
  }

  @Get()
  async getUserFolders(@Req() req) {
    const userId = req.user.id;
    return this.folderService.getUserFolders(userId);
  }

  @Get(':id')
  async getFolderById(@Param('id') folderId: string) {
    return this.folderService.getFolderById(folderId);
  }

  @Post(':id/files')
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
      path: join('uploads', file.filename),
    };

    return this.folderService.addFileToFolder(
      folderId,
      userId,
      fileData as File,
    );
  }

  @Post(':id/subfolders')
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

  @Patch(':id')
  async updateFolder(
    @Param('id') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    console.log('folderId', folderId);
    // return this.folderService.updateFolder(folderId, updateFolderDto, userId);
  }

  @Delete(':id')
  async deleteFolder(@Param('id') folderId: string, @Req() req) {
    const userId = req.user.id; // Extract userId from the authenticated user
    // return this.folderService.deleteFolder(folderId, userId);
  }
}
