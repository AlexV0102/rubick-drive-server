import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getModelToken } from '@nestjs/mongoose';
import { Folder } from '../folders/schemas/folder-schema';
import { File } from '../files/schemas/file.schema';
import { Model } from 'mongoose';

describe('SearchService', () => {
  let service: SearchService;
  let mockFolderModel: Partial<Model<Folder>>;
  let mockFileModel: Partial<Model<File>>;

  beforeEach(async () => {
    mockFolderModel = {
      find: jest.fn(),
    };

    mockFileModel = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getModelToken(Folder.name), useValue: mockFolderModel },
        { provide: getModelToken(File.name), useValue: mockFileModel },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return search results for folders and files', async () => {
    const mockFolders = [{ id: 'folder1', name: 'Test Folder' }];
    const mockFiles = [{ id: 'file1', name: 'Test File' }];

    (mockFolderModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFolders),
      }),
    });

    (mockFileModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFiles),
      }),
    });

    const result = await service.search('test');
    expect(result).toEqual({ folders: mockFolders, files: mockFiles });
    expect(mockFolderModel.find).toHaveBeenCalledWith({
      name: { $regex: 'test', $options: 'i' },
    });
    expect(mockFileModel.find).toHaveBeenCalledWith({
      name: { $regex: 'test', $options: 'i' },
    });
  });

  it('should return empty results if no folders or files match', async () => {
    (mockFolderModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    (mockFileModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await service.search('notfound');
    expect(result).toEqual({ folders: [], files: [] });
  });
});
