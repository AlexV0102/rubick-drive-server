import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ required: true })
  name: string; // Name of the file

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: false })
  folderId?: string;

  @Prop()
  path: string; // Path to the file in storage
}

export const FileSchema = SchemaFactory.createForClass(File);
