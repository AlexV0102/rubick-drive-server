import { Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from './schemas/folder-schema';
import { AuthModule } from 'src/auth/auth.module';
import { FileSchema } from 'src/files/schemas/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Folder.name, schema: FolderSchema },
      { name: File.name, schema: FileSchema },
    ]),
    AuthModule,
  ],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}
