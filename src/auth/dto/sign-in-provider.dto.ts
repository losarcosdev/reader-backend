/* eslint-disable prettier/prettier */
import { IsEmail, IsString } from 'class-validator';

export class SignInDtoProvider {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  profileImage: string;
}
