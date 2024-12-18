import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File } from './schemas/file.schema';
import { Model } from 'mongoose';
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

    const newPath = join('uploads', newName);

    fs.renameSync(oldPath, newPath);
    file.name = newName;
    file.path = newPath;
    return await file.save();
  }

  async cloneFile(fileId: string): Promise<File> {
    const originalFile = await this.fileModel.findById(fileId);
    if (!originalFile) throw new NotFoundException('Original file not found');

    const originalPath = originalFile.path;
    const newFileName = `copy_of_${originalFile.name}`;
    const newFilePath = join('uploads', newFileName);

    fs.copyFileSync(originalPath, newFilePath);

    const clonedFile = new this.fileModel({
      ...originalFile.toObject(),
      name: newFileName,
      path: newFilePath,
      _id: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await clonedFile.save();
  }

  async uploadFile(fileData: Partial<File>, userId: string): Promise<File> {
    const file = new this.fileModel({
      ...fileData,
      owner: userId,
    });
    return file.save();
  }

  async updateFilePermissions(
    fileId: string,
    permissions: { email: string; role: 'viewer' | 'editor' }[],
    userId: string,
  ) {
    const file = await this.fileModel.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.owner !== userId) throw new ForbiddenException('Access denied');

    file.sharedWith = permissions;
    return await file.save();
  }

  async getFiles(userId, folderId?: string): Promise<File[]> {
    const query = folderId ? { folderId } : {};
    return this.fileModel.find({ owner: userId, ...query }).exec();
  }

  async getFile(fileId: string) {
    const file = await this.fileModel.findById(fileId);
    return file;
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return this.fileModel.find({ owner: userId }).exec();
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.getFile(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await this.fileModel.findByIdAndDelete(fileId).exec();
  }

  async getFileById(fileId: string): Promise<File | null> {
    return this.fileModel.findById(fileId).exec();
  }

  async changeFileVisibility(
    fileId: string,
    userId: string,
    isPublic: boolean,
  ) {
    const file = await this.fileModel.findById(fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }
    if (file.owner !== userId) {
      throw new ForbiddenException(
        'You do not have permission to change this file visibility',
      );
    }

    file.isPublic = isPublic;
    await file.save();

    return {
      message: `File visibility changed to ${isPublic ? 'Public' : 'Private'}`,
      file,
    };
  }
}
