import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AddMediaToUserRequest, AddMediaToUserResponse, DeleteMediaFromUserRequest, DeleteMediaFromUserResponse, GetUserMediaListRequest, GetUserMediaListResponse, SetSeenStatusRequest, SetSeenStatusResponse, UserMediaServiceController } from './user_media_service.pb';
import { Observable } from 'rxjs';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController implements UserMediaServiceController {
  constructor(private readonly appService: AppService) { }

  @GrpcMethod('UserMediaService', 'GetUserMediaList')
  getUserMediaList(request: GetUserMediaListRequest): Promise<GetUserMediaListResponse> {
    return this.appService.getUserMediaList(request);
  }

  @GrpcMethod('UserMediaService', 'AddMediaToUser')
  addMediaToUser(request: AddMediaToUserRequest): Promise<AddMediaToUserResponse> {
    return this.appService.addMediaToUser(request);
  }

  @GrpcMethod('UserMediaService', 'DeleteMediaFromUser')
  deleteMediaFromUser(request: DeleteMediaFromUserRequest): Promise<DeleteMediaFromUserResponse> {
    return this.appService.deleteMediaFromUser(request);
  }

  @GrpcMethod('UserMediaService', 'SetSeenStatus')
  setSeenStatus(request: SetSeenStatusRequest): Promise<SetSeenStatusResponse> {
    return this.appService.setSeenStatus(request);
  }



}
