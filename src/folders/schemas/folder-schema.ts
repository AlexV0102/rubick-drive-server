import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Folder extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, ref: 'User', required: true })
  owner: string;

  @Prop({ type: String, ref: 'Folder', default: null })
  parentFolderId?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'File' }], default: [] })
  files: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Folder' }], default: [] })
  subFolders: Types.ObjectId[];
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
