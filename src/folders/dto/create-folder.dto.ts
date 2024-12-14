import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  parentFolderId?: string;

  @IsString()
  @IsNotEmpty()
  owner: string;
}
