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

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({
    type: [
      {
        email: { type: String, required: true },
        role: { type: String, enum: ['viewer', 'editor'], required: true },
      },
    ],
    default: [],
  })
  sharedWith: Array<{ email: string; role: 'viewer' | 'editor' }>;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
