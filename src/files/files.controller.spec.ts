import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PermissionsGuard } from 'src/permission/permission.guard';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

const mockFile = {
  id: '1',
  name: 'test.txt',
  fileType: 'text/plain',
  size: 1024,
  path: '/uploads/test.txt',
};

const mockFilesService = {
  uploadFile: jest.fn().mockResolvedValue(mockFile),
  getFile: jest.fn().mockResolvedValue(mockFile),
  deleteFile: jest.fn().mockResolvedValue(undefined),
};

class MockPermissionsGuard {
  canActivate(): boolean {
    return true;
  }
}

class MockJwtAuthGuard {
  canActivate(): boolean {
    return true;
  }
}

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: FilesService, useValue: mockFilesService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useClass(MockPermissionsGuard)
      .compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should upload a file', async () => {
    const mockRequest = { user: { id: '12345' } };
    const mockFileBuffer = {
      originalname: 'test.txt',
      buffer: Buffer.from(''),
    };
    const uploadFileDto = { folderId: 'folderId', isPublic: false };

    const result = await controller.uploadFile(
      mockRequest,
      mockFileBuffer as any,
      uploadFileDto as any,
    );
    expect(result).toEqual(mockFile);
    expect(mockFilesService.uploadFile).toHaveBeenCalled();
  });

  it('should get file metadata by ID', async () => {
    const result = await controller.getFileMetadata('1');
    expect(result).toEqual(mockFile);
    expect(mockFilesService.getFile).toHaveBeenCalledWith('1');
  });

  it('should delete a file', async () => {
    const mockRequest = { user: { id: '12345' } };
    const result = await controller.deleteFile('1', mockRequest as any);
    expect(result).toEqual({ message: 'File deleted successfully.' });
    expect(mockFilesService.deleteFile).toHaveBeenCalledWith('1', '12345');
  });
});
