import { Test, TestingModule } from '@nestjs/testing';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../permission/permission.guard';

const mockFoldersService = {
  createFolder: jest.fn(),
  getUserFolders: jest.fn(),
  getFolderById: jest.fn(),
  deleteFolder: jest.fn(),
};

describe('FoldersController', () => {
  let controller: FoldersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoldersController],
      providers: [{ provide: FoldersService, useValue: mockFoldersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FoldersController>(FoldersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createFolder', () => {
    it('should create a new folder', async () => {
      const dto = { name: 'Test Folder', owner: 'user123' };
      const req = { user: { id: 'user123' } };
      const result = { id: 'folderId', name: 'Test Folder' };

      mockFoldersService.createFolder.mockResolvedValue(result);

      expect(await controller.createFolder(dto, req)).toEqual(result);
    });
  });

  describe('getUserFolders', () => {
    it('should return user folders', async () => {
      const req = { user: { id: 'user123' } };
      const result = [{ id: 'folderId', name: 'Folder 1' }];

      mockFoldersService.getUserFolders.mockResolvedValue(result);

      expect(await controller.getUserFolders(req)).toEqual(result);
    });
  });

  describe('deleteFolder', () => {
    it('should delete a folder', async () => {
      const folderId = 'folderId';

      mockFoldersService.deleteFolder.mockResolvedValue({});

      await expect(controller.deleteFolder(folderId)).resolves.not.toThrow();
    });
  });
});
