import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ required: true })
  name: string; // File name

  @Prop({ required: true })
  fileType: string; // MIME type

  @Prop({ required: true })
  size: number; // File size in bytes

  @Prop({ type: String, required: false, default: null })
  folderId?: string;

  @Prop({ required: true })
  path: string; // Path to file in the filesystem

  @Prop({ default: false })
  isPublic: boolean; // Public or private file

  @Prop({
    type: [{ userId: { type: String, ref: 'User' }, permission: String }],
    default: [],
  })
  sharedWith: Array<{ userId: string; permission: 'viewer' | 'editor' }>;

  @Prop({ type: String, ref: 'User', required: true })
  owner: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
