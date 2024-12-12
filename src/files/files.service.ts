import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File } from './schemas/file.schema';
import { Model } from 'mongoose';
import { UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class FilesService {
  updateFileByName(filename: string, arg1: { name: string; path: string }) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async uploadFile(uploadFile: UploadFileDto) {
    const file = new this.fileModel(uploadFile);
    return await file.save();
  }

  async findFileByOriginalName(filename: string): Promise<File | null> {
    return this.fileModel.findOne({ name: filename }).exec();
  }

  async getFiles(folderId?: string): Promise<File[]> {
    const query = folderId ? { folderId } : {};
    return this.fileModel.find(query).exec();
  }

  async getFileById(fileId: string): Promise<File> {
    return this.fileModel.findById(fileId).exec();
  }

  async deleteFile(fileId: string): Promise<void> {
    this.fileModel.findByIdAndDelete(fileId).exec();
  }
}
