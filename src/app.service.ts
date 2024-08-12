import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddMediaToUserRequest, AddMediaToUserResponse, GetUserMediaListRequest, GetUserMediaListResponse, Media } from './user_media_service.pb';
import { User, UserDocument } from './mongoose/user.schema';
import { Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';


@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async getUserMediaList(request: GetUserMediaListRequest): Promise<GetUserMediaListResponse> {
    try {
      const userId = new Types.ObjectId(request.userId);
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'User not found' });
      }

      const mediaList: Media[] = user.mediaList.map(media => ({
        mediaId: media.mediaId,
        mediaType: media.mediaType,
        seen: media.seen,
      }));

      return { mediaList };
    } catch (error) {
      throw new RpcException({ code: status.INTERNAL, message: 'Error getting user media: ' + error.message });

    }

  }

  async addMediaToUser(request: AddMediaToUserRequest): Promise<AddMediaToUserResponse> {
    try {
      const userId = new Types.ObjectId(request.userId);
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'User not found' });
      }

      const mediaExists = user.mediaList.some(
        media => media.mediaId === request.mediaId && media.mediaType === request.mediaType,
      );

      if (mediaExists) {
        return { success: false, message: 'Media already exists in user list' };
      }

      user.mediaList.push({
        mediaId: request.mediaId,
        mediaType: request.mediaType,
        seen: false, // Assuming new media is initially not seen
      });

      await user.save();

      return { success: true, message: 'Media added successfully' };
    } catch (error) {
      throw new RpcException({ code: status.INTERNAL, message: 'Error adding media: ' + error.message });
    }

  }

  getHello(): string {
    return 'Hello World!';
  }
}
