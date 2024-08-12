import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AddMediaToUserRequest, AddMediaToUserResponse, GetUserMediaListRequest, GetUserMediaListResponse, UserMediaServiceController } from './user_media_service.pb';
import { Observable } from 'rxjs';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController implements UserMediaServiceController{
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('UserMediaService', 'GetUserMediaList')
  getUserMediaList(request: GetUserMediaListRequest): Promise<GetUserMediaListResponse> | Observable<GetUserMediaListResponse> | GetUserMediaListResponse {
    return this.appService.getUserMediaList(request);
  }

  @GrpcMethod('UserMediaService', 'AddMediaToUser')
  addMediaToUser(request: AddMediaToUserRequest): Promise<AddMediaToUserResponse> | Observable<AddMediaToUserResponse> | AddMediaToUserResponse {
    return this.appService.addMediaToUser(request);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
