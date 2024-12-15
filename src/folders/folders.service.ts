import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Folder } from './schemas/folder-schema';
import { Model } from 'mongoose';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { File } from 'src/files/schemas/file.schema';

@Injectable()
export class FoldersService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    @InjectModel(File.name) private readonly fileModel: Model<File>, // Inject File model
  ) {}

  addSubFolderToFolder(folderId: string, createFolderDto: CreateFolderDto) {
    console.log('folderId', folderId);
    console.log('createFolderDto', createFolderDto);
    const folder = new this.folderModel({
      ...createFolderDto,
    });
    const result = this.folderModel.findByIdAndUpdate(
      { _id: folderId },
      { $push: { subFolders: folder } },
    );
    console.log('result', result);
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
    const savedFile = await file.save();
    console.log('data', fileData);

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
    return this.folderModel.findById({ _id: folderId }).exec();
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
