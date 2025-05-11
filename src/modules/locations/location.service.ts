import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from '../../schemas/location.schema';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<Location>,
  ) {}

  async create(dto: CreateLocationDto): Promise<Location> {
    return this.locationModel.create(dto);
  }

  async findAll(): Promise<Location[]> {
    return this.locationModel.find().lean().exec();
  }

  async update(id: string, dto: UpdateLocationDto): Promise<Location> {
    const loc = await this.locationModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!loc) throw new NotFoundException('Location not found');
    return loc;
  }

  async remove(id: string): Promise<void> {
    const res = await this.locationModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Location not found');
  }
}
