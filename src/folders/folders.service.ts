import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Folder } from './schemas/folder-schema';
import { Model } from 'mongoose';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { File } from 'src/files/schemas/file.schema';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class FoldersService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  addSubFolderToFolder(folderId: string, createFolderDto: CreateFolderDto) {
    const folder = new this.folderModel({
      ...createFolderDto,
    });
    const result = this.folderModel.findByIdAndUpdate(
      { _id: folderId },
      { $push: { subFolders: folder } },
    );
    return result;
  }
  async addFileToFolder(
    folderId: string,
    userId: string,
    fileData: Partial<File>,
  ) {
    const file = new this.fileModel({
      ...fileData,
      owner: userId,
    });
    // const savedFile = await file.save();

    const folder = await this.folderModel.findOneAndUpdate(
      { _id: folderId, owner: userId },
      { $push: { files: file } },
      { new: true, useFindAndModify: false },
    );

    if (!folder) {
      throw new NotFoundException('Folder not found or access denied');
    }

    return folder;
  }

  async createFolder(createFolderDto: CreateFolderDto): Promise<Folder> {
    const folder = new this.folderModel({
      ...createFolderDto,
    });
    return folder.save();
  }

  async getUserFolders(userId: string): Promise<Folder[]> {
    return this.folderModel.find({ owner: userId }).exec();
  }

  async getFolderById(folderId: string) {
    const folder = await this.folderModel.findById({ _id: folderId }).exec();
    return folder;
  }

  async updateFolder(
    folderId: string,
    updateFolderDto: UpdateFolderDto,
  ): Promise<Folder> {
    const folder = await this.folderModel
      .findByIdAndUpdate(folderId, updateFolderDto, { new: true })
      .exec();
    if (!folder) throw new NotFoundException('Folder not found');
    return folder;
  }

  async deleteFolder(folderId: string): Promise<void> {
    const folder = await this.folderModel.findById(folderId).exec();
    if (!folder) throw new NotFoundException('Folder not found');

    const files = await this.fileModel.find({ folderId: folderId }).exec();
    for (const file of files) {
      const filePath = join(process.cwd(), file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await this.fileModel.findByIdAndDelete(file._id).exec();
    }
    const subfolders = await this.folderModel
      .find({ parentFolderId: folderId })
      .exec();
    for (const subfolder of subfolders) {
      await this.deleteFolder(subfolder._id as string);
    }
    await this.folderModel.findByIdAndDelete(folderId).exec();
  }
  async changeFolderVisibility(
    folderId: string,
    userId: string,
    isPublic: boolean,
  ) {
    const folder = await this.folderModel.findById(folderId);
    if (!folder) throw new NotFoundException('Folder not found');

    if (folder.owner !== userId) {
      throw new ForbiddenException(
        'You are not authorized to change folder visibility',
      );
    }

    folder.isPublic = isPublic;
    await folder.save();

    return {
      message: `Folder visibility updated to ${isPublic ? 'Public' : 'Private'}`,
      folder,
    };
  }

  async updateFolderPermissions(
    folderId: string,
    userId: string,
    permissions: { email: string; role: 'viewer' | 'editor' }[],
  ) {
    const folder = await this.folderModel.findById(folderId);
    if (!folder) throw new NotFoundException('Folder not found');

    if (folder.owner !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update folder permissions',
      );
    }

    folder.sharedWith = permissions;
    await folder.save();

    return {
      message: 'Folder permissions updated',
      folder,
    };
  }
}
