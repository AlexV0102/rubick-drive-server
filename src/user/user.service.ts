import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('files sharedFiles').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('files sharedFiles')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException('User not found');
  }
}
