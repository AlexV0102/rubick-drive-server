import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
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
          // const uniqueName = `${Date.now()}-${Math.round(
          //   Math.random() * 1e9,
          // )}${extname(file.originalname)}`;
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: Partial<UploadFileDto>,
  ) {
    const { folderId } = uploadFileDto;
    return this.filesService.uploadFile({
      name: file.originalname,
      fileType: file.mimetype,
      size: file.size,
      folderId,
      path: file.path,
    });
  }
  @Get()
  getFiles(@Query('folderId') folderId?: string) {
    return this.filesService.getFiles(folderId);
  }

  @Get('serve/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);
    const fileMetadata =
      await this.filesService.findFileByOriginalName(filename);
    console.log('filePath', filePath);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    res.setHeader('Content-Type', fileMetadata.fileType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileMetadata.name}"`,
    );
    res.sendFile(filePath);
  }

  @Get(':id')
  getFileById(@Param('id') fileId: string) {
    return this.filesService.getFileById(fileId);
  }

  @Delete(':id')
  deleteFile(@Param('id') fileId: string) {
    return this.filesService.deleteFile(fileId);
  }

  @Put('update/:filename')
  async updateFileByName(
    @Param('filename') filename: string,
    @Body() updateFileDto: { newName: string },
  ) {
    const { newName } = updateFileDto;

    const fileMetadata =
      await this.filesService.findFileByOriginalName(filename);
    if (!fileMetadata) {
      throw new NotFoundException('File not found');
    }

    const oldPath = fileMetadata.path;
    const newPath = join(process.cwd(), 'uploads', newName);
    fs.renameSync(oldPath, newPath);

    return this.filesService.updateFileByName(filename, {
      name: newName,
      path: newPath,
    });
  }
}
