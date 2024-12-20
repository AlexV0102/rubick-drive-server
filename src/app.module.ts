import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { FoldersModule } from './folders/folders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    FilesModule,
    FoldersModule,
    SearchModule,
  ],
})
export class AppModule {}
