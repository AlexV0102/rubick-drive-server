import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder } from '../folders/schemas/folder-schema';
import { File } from '../files/schemas/file.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async search(query: string) {
    const folderResults = await this.folderModel
      .find({ name: { $regex: query, $options: 'i' } })
      .select('id name')
      .exec();

    const fileResults = await this.fileModel
      .find({ name: { $regex: query, $options: 'i' } })
      .select('id name')
      .exec();

    return { folders: folderResults, files: fileResults };
  }
}
