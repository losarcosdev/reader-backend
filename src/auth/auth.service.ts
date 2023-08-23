import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignInDto, SignUpDto, SignInDtoProvider } from './dto';
import { Repository } from 'typeorm';
import { User } from '../users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { generateRandomUsername } from 'src/common/utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signInWithProvider({ ...userData }: SignInDtoProvider) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!user) {
        const newUser = this.userRepository.create({
          ...userData,
          username: generateRandomUsername({ name: userData.fullName }),
          password: bcrypt.hashSync('###########', 10),
        });

        await this.userRepository.save(newUser);

        return {
          ...newUser,
          token: this.signJWT(newUser.id),
        };
      }

      return {
        ...user,
        token: this.signJWT(user.id),
      };
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async signIn({ email, password }: SignInDto) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException(`User with email: ${email} not found`);
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new NotFoundException('Wrong password');
      }

      return {
        ...user,
        token: this.signJWT(user.id),
      };
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async signUp({ ...userData }: SignUpDto) {
    try {
      // Check if the email that the user wants to use is already in use
      const user = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (user) {
        throw new BadRequestException('Email already in use');
      }

      // If not , creates a new user
      const newUser = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(userData.password, 10),
      });

      await this.userRepository.save(newUser);

      return {
        ...newUser,
        token: this.signJWT(newUser.id),
      };
    } catch (error) {
      this.handleErrors(error);
    }
  }

  private signJWT(id: string) {
    return this.jwtService.sign({ id });
  }

  private handleErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(`Unexpected error: ${error}`);
    throw new InternalServerErrorException('Server error - check logs');
  }
}
