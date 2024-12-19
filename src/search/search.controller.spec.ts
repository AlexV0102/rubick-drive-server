import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let mockSearchService: Partial<SearchService>;

  beforeEach(async () => {
    mockSearchService = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return search results for folders and files', async () => {
    const mockResults = {
      folders: [{ id: 'folder1', name: 'Test Folder' }],
      files: [{ id: 'file1', name: 'Test File' }],
    };

    (mockSearchService.search as jest.Mock).mockResolvedValue(mockResults);

    const result = await controller.search('test');
    expect(result).toEqual(mockResults);
    expect(mockSearchService.search).toHaveBeenCalledWith('test');
  });

  it('should return empty results if query is empty', async () => {
    const result = await controller.search('');
    expect(result).toEqual({ folders: [], files: [] });
    expect(mockSearchService.search).not.toHaveBeenCalled();
  });

  it('should trim query and return search results', async () => {
    const mockResults = {
      folders: [{ id: 'folder1', name: 'Test Folder' }],
      files: [{ id: 'file1', name: 'Test File' }],
    };

    (mockSearchService.search as jest.Mock).mockResolvedValue(mockResults);

    const result = await controller.search('   test   ');
    expect(result).toEqual(mockResults);
    expect(mockSearchService.search).toHaveBeenCalledWith('test');
  });
});
