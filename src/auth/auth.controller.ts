import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignInDtoProvider, SignUpDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in/provider')
  signInWithProvider(@Body() signInDtoProvider: SignInDtoProvider) {
    return this.authService.signInWithProvider(signInDtoProvider);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('profileImage'))
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }
}
