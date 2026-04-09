import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History, HistoryDocument } from 'src/schemas/history.schema';
import { LogModule } from 'src/enums/logModules.enum';
import { LogAction } from 'src/enums/logAction.enum';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name) private historyModel: Model<HistoryDocument>,
  ) {}

  async log(
    module: LogModule,
    action: LogAction,
    userId: string,
    reason?: string,
    details?: any,
  ) {
    const logEntry = new this.historyModel({
      module,
      action,
      user: userId,
      reason,
      details,
    });

    return logEntry.save();
  }

  async getAll(filter?: any) {
    return this.historyModel.find(filter).sort({ createdAt: -1 }).lean();
  }
}
