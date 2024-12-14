import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File } from './schemas/file.schema';
import { Model } from 'mongoose';
import { UploadFileDto } from './dto/upload-file.dto';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async updateFile(fileId: string, newName: string) {
    const file = await this.getFileById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const oldPath = file.path;
    const newPath = join(process.cwd(), 'uploads', newName);

    fs.renameSync(oldPath, newPath);
    file.name = newName;
    file.path = newPath;
    return await file.save();
  }

  async uploadFile(fileData: Partial<File>, userId: string): Promise<File> {
    const file = new this.fileModel({
      ...fileData,
      owner: userId,
    });
    return file.save();
  }

  async getFiles(folderId?: string): Promise<File[]> {
    const query = folderId ? { folderId } : {};
    return this.fileModel.find(query).exec();
  }

  async getFileById(fileId: string): Promise<File> {
    return this.fileModel.findById(fileId).exec();
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return this.fileModel.find({ owner: userId }).exec();
  }

  async deleteFile(fileId: string): Promise<void> {
    const file = await this.getFileById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    fs.unlinkSync(file.path);
    await this.fileModel.findByIdAndDelete(fileId).exec();
  }
}
