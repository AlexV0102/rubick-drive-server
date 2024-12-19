import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getModelToken } from '@nestjs/mongoose';
import { File } from './schemas/file.schema';
import { Model } from 'mongoose';

const mockFile = {
  name: 'test.txt',
  fileType: 'text/plain',
  size: 1024,
  path: 'uploads/test.txt',
  owner: '12345',
  save: jest.fn().mockResolvedValue(true),
};

const mockFileModel = {
  create: jest.fn().mockResolvedValue(mockFile),
  findById: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockFile),
  }),
  findByIdAndDelete: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockFile),
  }),
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockFile]),
  }),
};

describe('FilesService', () => {
  let service: FilesService;
  let model: Model<File>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getModelToken(File.name),
          useValue: mockFileModel,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    model = module.get<Model<File>>(getModelToken(File.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload a file', async () => {
    const fileData = {
      name: 'test.txt',
      fileType: 'text/plain',
      size: 1024,
      path: 'uploads/test.txt',
    };

    const result = await service.uploadFile(fileData, '12345');
    expect(result).toEqual(mockFile);
    expect(mockFileModel.create).toHaveBeenCalledWith({
      ...fileData,
      owner: '12345',
    });
  });

  it('should retrieve a file by ID', async () => {
    const result = await service.getFileById('1');
    expect(result).toEqual(mockFile);
    expect(mockFileModel.findById).toHaveBeenCalledWith('1');
  });

  it('should delete a file', async () => {
    const result = await service.deleteFile('1', '12345');
    expect(result).toBeUndefined();
    expect(mockFileModel.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
