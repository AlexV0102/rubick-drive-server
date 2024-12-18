import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  size: number;
  @Prop({ type: String, required: false, default: null })
  folderId?: string;

  @Prop({ required: true })
  path: string;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({
    type: [
      {
        email: { type: String },
        role: { type: String, enum: ['viewer', 'editor'] },
      },
    ],
    default: [],
  })
  sharedWith: Array<{ email: string; role: 'viewer' | 'editor' }>;

  @Prop({ type: String, required: true, ref: 'User' })
  owner: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
