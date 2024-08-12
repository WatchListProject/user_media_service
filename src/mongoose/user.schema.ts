import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class Media {
  @Prop({ required: true })
  mediaId: string; // The ID of the media in the corresponding media API

  @Prop({ 
    required: true,
    enum: ['MOVIE', 'SERIE'] // Enum to restrict values
  })
  mediaType: string; // The type of the media in the corresponding media API ej: mediaType=Movie

  @Prop({ required: true })
  seen: boolean;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [MediaSchema], default: [] }) // Explicitly defining the type as an array of MediaSchema
  mediaList: Media[];
}

export const UserSchema = SchemaFactory.createForClass(User);
