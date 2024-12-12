import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  fileType: string;

  @IsNumber()
  size: number;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsString()
  path: string;
}
