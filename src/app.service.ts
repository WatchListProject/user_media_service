import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddMediaToUserRequest, AddMediaToUserResponse, DeleteMediaFromUserRequest, DeleteMediaFromUserResponse, GetUserMediaListRequest, GetUserMediaListResponse, Media, SetSeenStatusRequest, SetSeenStatusResponse } from './user_media_service.pb';
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
      const user = await this.userModel.findOne({ email: request.email }).exec();
      if (!user) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'User not found' });
      }

      const mediaList: Media[] = user.mediaList.map(media => ({
        mediaId: media.mediaId,
        mediaType: media.mediaType,
        seenStatus: media.seenStatus,
        addedAt: media.addedAt.toISOString(),
      }));

      return { mediaList };
    } catch (error) {
      console.log(error);
      throw new RpcException({ code: status.INTERNAL, message: 'Error getting user media: ' + error.message });

    }

  }

  async addMediaToUser(request: AddMediaToUserRequest): Promise<AddMediaToUserResponse> {
    try {
      const user = await this.userModel.findOne({ email: request.email }).exec();

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
        seenStatus: false,
        addedAt: new Date(),
      });


      await user.save();

      return { success: true, message: 'Media added successfully' };
    } catch (error) {
      throw new RpcException({ code: status.INTERNAL, message: 'Error adding media: ' + error.message });
    }

  }

  async setSeenStatus(request: SetSeenStatusRequest): Promise<SetSeenStatusResponse> {
    try {
      // Buscar al usuario por su email
      const user = await this.userModel.findOne({ email: request.email }).exec();
  
      // Verificar si el usuario existe
      if (!user) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'User not found' });
      }
  
      // Buscar el medio en la lista del usuario
      const media = user.mediaList.find(media => media.mediaId === request.mediaId);
  
      // Verificar si el medio está en la lista del usuario
      if (!media) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'Media not found in user list' });
      }
  
      // Actualizar el estado de visualización
      media.seenStatus = request.seenStatus;
  
      // Marcar la lista de medios como modificada para asegurar que Mongoose registre el cambio
      user.markModified('mediaList');
  
      // Guardar los cambios en la base de datos
      await user.save();
  
      // Confirmar que el usuario se actualizó correctamente
      console.log(user);
  
      // Devolver respuesta exitosa
      return { success: true, message: 'Seen status updated successfully' };
    } catch (error) {
      // Manejo de errores
      throw new RpcException({ code: status.INTERNAL, message: 'Error setting media seen status: ' + error.message });
    }
  }
  

  async deleteMediaFromUser(request: DeleteMediaFromUserRequest): Promise<DeleteMediaFromUserResponse> {
    try {
      const user = await this.userModel.findOne({ email: request.email }).exec();

      if (!user) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'User not found' });
      }

      // Buscar el medio en la lista del usuario
      const mediaIndex = user.mediaList.findIndex(media => media.mediaId === request.mediaId);

      if (mediaIndex === -1) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'Media not found in user list' });
      }

      // Eliminar el medio de la lista
      user.mediaList.splice(mediaIndex, 1);

      // Guardar los cambios en la base de datos
      await user.save();

      return { success: true, message: 'Media removed from user list successfully' };
    } catch (error) {
      throw new RpcException({ code: status.INTERNAL, message: 'Error deleting media from user list: ' + error.message });
    }
  }

}
