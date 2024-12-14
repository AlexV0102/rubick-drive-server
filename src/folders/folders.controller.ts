import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadFileDto } from 'src/files/dto/upload-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('folders')
// @UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly folderService: FoldersService) {}

  @Post()
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.folderService.createFolder(createFolderDto);
  }

  @Get(':id')
  async getUserFolders(@Param('id') userId: string) {
    return this.folderService.getUserFolders(userId);
  }

  @Post('getFolderById')
  async getFolderById(@Body() folderId: string) {
    console.log('folderId', folderId);
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
    @Body() file: UploadFileDto,
  ) {
    console.log('folderId', folderId);
    console.log('file', file);
    return this.folderService.addFileToFolder(folderId, file);
  }

  @Post(':id/folders')
  async addSubFolderToFolder(
    @Param('id') folderId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    return this.folderService.addSubFolderToFolder(folderId, createFolderDto);
  }

  @Patch(':id')
  async updateFolder(
    @Param('id') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    console.log('folderId', folderId);
    return this.folderService.updateFolder(folderId, updateFolderDto);
  }

  @Delete(':id')
  async deleteFolder(@Param('id') folderId: string) {
    return this.folderService.deleteFolder(folderId);
  }
}
