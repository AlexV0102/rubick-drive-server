import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: [Types.ObjectId], ref: 'File', default: [] })
  files: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'File', default: [] })
  sharedFiles: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
