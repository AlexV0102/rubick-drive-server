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

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
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
  async cloneFile(@Param('id') fileId: string) {
    return this.filesService.cloneFile(fileId);
  }

  @Get()
  getFiles(@Query('folderId') folderId?: string) {
    return this.filesService.getFiles(folderId);
  }

  @Get(':id/user')
  getFilesByUserId(@Param('id') userId: string) {
    return this.filesService.getUserFiles(userId);
  }

  @Get(':id/serve')
  async serveFile(
    @Param('id') fileId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const userId = req.user?.id || null;
    const file = await this.filesService.getFile(fileId, userId);

    const filePath = join(process.cwd(), file.path);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
    res.sendFile(filePath);
  }

  @Get(':id/metadata')
  async getFileMetadata(@Param('id') fileId: string, @Req() req: any) {
    const userId = req.user?.id || null;
    return this.filesService.getFile(fileId, userId);
  }

  @Delete(':id')
  deleteFile(@Param('id') fileId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.filesService.deleteFile(fileId, userId);
  }

  @Put(':id/rename')
  async updateFile(
    @Param('id') fileId: string,
    @Body() updateFileDto: { name: string },
  ) {
    return this.filesService.updateFile(fileId, updateFileDto.name);
  }
}
