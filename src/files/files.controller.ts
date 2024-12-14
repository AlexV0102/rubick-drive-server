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
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('files')
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
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: Partial<UploadFileDto>,
  ) {
    const { folderId, isPublic, userId } = uploadFileDto;
    return this.filesService.uploadFile(
      {
        name: file.originalname,
        fileType: file.mimetype,
        size: file.size,
        folderId,
        path: file.path,
        isPublic,
      },
      userId,
    );
  }

  @Get()
  getFiles(@Query('folderId') folderId?: string) {
    return this.filesService.getFiles(folderId);
  }

  @Get(':id')
  getFilesByUserId(@Param('id') userId: string) {
    return this.filesService.getUserFiles(userId);
  }

  // TODO: add auth guard for this
  @Get('serve/:id')
  async serveFile(@Param('id') fileId: string, @Res() res: Response) {
    const fileMetadata = await this.filesService.getFileById(fileId);
    if (!fileMetadata) {
      throw new NotFoundException('File not found');
    }

    const filePath = join(process.cwd(), fileMetadata.path);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }
    res.setHeader('Content-Type', fileMetadata.fileType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileMetadata.name}"`,
    );
    res.sendFile(filePath);
  }

  @Delete(':id')
  deleteFile(@Param('id') fileId: string) {
    return this.filesService.deleteFile(fileId);
  }

  @Put('update/:id')
  async updateFile(
    @Param('id') fileId: string,
    @Body() updateFileDto: { newName: string },
  ) {
    const updatedFile = await this.filesService.updateFile(
      fileId,
      updateFileDto.newName,
    );
    return updatedFile;
  }
}
