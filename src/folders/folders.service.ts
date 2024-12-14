import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Folder } from './schemas/folder-schema';
import { Model } from 'mongoose';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UploadFileDto } from 'src/files/dto/upload-file.dto';

@Injectable()
export class FoldersService {
  addSubFolderToFolder(folderId: string, createFolderDto: CreateFolderDto) {
    console.log('folderId', folderId);
    console.log('createFolderDto', createFolderDto);
    const result = this.folderModel.findByIdAndUpdate(
      { _id: folderId },
      { $push: { subFolders: createFolderDto } },
    );
    console.log('result', result);
    return result;
  }
  addFileToFolder(folderId: string, file: UploadFileDto) {
    return this.folderModel.findByIdAndUpdate(
      {
        _id: folderId,
      },
      {
        $push: { files: file },
      },
    );
  }
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
  ) {}

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
    return this.folderModel.findById(folderId).exec();
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
    const folder = await this.folderModel.findByIdAndDelete(folderId).exec();
    if (!folder) throw new NotFoundException('Folder not found');
  }
}
