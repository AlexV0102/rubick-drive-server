import { Test, TestingModule } from '@nestjs/testing';
import { FoldersService } from 'src/folders/folders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Folder } from 'src/folders/schemas/folder-schema';
import { File } from '../files/schemas/file.schema';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockFolder = {
  id: 'folder123',
  name: 'Test Folder',
  owner: 'user123',
  isPublic: false,
  files: [],
  subFolders: [],
  save: jest.fn(),
};

const mockFile = {
  id: 'file123',
  name: 'Test File',
  folderId: 'folder123',
  size: 1024,
  path: 'uploads/test.txt',
  save: jest.fn(),
};

const mockFolderModel = {
  findById: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockFolder),
  }),
  findByIdAndDelete: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockFolder),
  }),
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockFolder]),
  }),
  create: jest.fn().mockResolvedValue(mockFolder),
};

const mockFileModel = {
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockFile]),
  }),
};

describe('FoldersService', () => {
  let service: FoldersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoldersService,
        {
          provide: getModelToken(Folder.name),
          useValue: mockFolderModel,
        },
        {
          provide: getModelToken(File.name),
          useValue: mockFileModel,
        },
      ],
    }).compile();

    service = module.get<FoldersService>(FoldersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFolder', () => {
    it('should create a new folder', async () => {
      const createFolderDto = { name: 'New Folder', owner: 'user123' };
      const result = await service.createFolder(createFolderDto);

      expect(mockFolderModel.create).toHaveBeenCalledWith(createFolderDto);
      expect(result).toEqual(mockFolder);
    });
  });

  describe('getUserFolders', () => {
    it('should return all folders for a user', async () => {
      const result = await service.getUserFolders('user123');

      expect(mockFolderModel.find).toHaveBeenCalledWith({ owner: 'user123' });
      expect(result).toEqual([mockFolder]);
    });
  });

  describe('getFolderById', () => {
    it('should return a folder by ID', async () => {
      const result = await service.getFolderById('folder123');

      expect(mockFolderModel.findById).toHaveBeenCalledWith({
        _id: 'folder123',
      });
      expect(result).toEqual(mockFolder);
    });

    it('should throw NotFoundException if folder does not exist', async () => {
      mockFolderModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getFolderById('invalidId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteFolder', () => {
    it('should throw NotFoundException if folder does not exist', async () => {
      mockFolderModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteFolder('invalidId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changeFolderVisibility', () => {
    it('should throw ForbiddenException if user is not the owner', async () => {
      mockFolder.owner = 'anotherUser';

      await expect(
        service.changeFolderVisibility('folder123', 'user123', true),
      ).rejects.toThrow(ForbiddenException);

      mockFolder.owner = 'user123';
    });
  });
});
