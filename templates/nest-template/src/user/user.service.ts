import {
  CACHE_MANAGER,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SigninRequestDto, SignupRequestDto } from './dto/user.request.dto';
import * as bcrypt from 'bcryptjs';
import {
  SigninResponseDto,
  SignoutResponseDto,
  SignupResponseDto,
  UpdateAccessTokenResponseDto,
  UserFindResponseDto,
} from './dto/user.response.dto';
import { Cache } from 'cache-manager';
import { Request, Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async signUp(req: SignupRequestDto): Promise<SignupResponseDto> {
    const { email, password, nickname } = req;

    const duplicatedUser = await this.userRepository.findOne({
      where: { email },
    });

    if (duplicatedUser) {
      throw new ConflictException('중복된 이메일 입니다.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.userRepository.insert({
      email,
      password: hashedPassword,
      nickname,
    });

    return {
      message: '회원 가입 성공',
    };
  }

  private async _createAccessToken(email): Promise<string> {
    return await this.jwtService.sign({ email });
  }

  private async _createRefreshToken(email, id): Promise<string> {
    const refreshToken = await this.jwtService.sign(
      { email },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '30d',
      },
    );

    this.cacheManager.set(id, refreshToken);

    return refreshToken;
  }

  async signIn(req: SigninRequestDto): Promise<SigninResponseDto> {
    const { email, password } = req;

    const user = await this.userRepository.findOne({ where: { email } });
    const id = user?.id;

    if (!user) {
      throw new NotFoundException('이메일을 확인해 주세요.');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해 주세요.');
    }

    const accessToken = await this._createAccessToken(email);
    const refreshToken = await this._createRefreshToken(email, id);

    return {
      message: '로그인 성공',
      id,
      accessToken,
      refreshToken,
    };
  }

  async updateAccessToken(
    req: Request,
    res: Response,
    id: string,
  ): Promise<UpdateAccessTokenResponseDto> {
    try {
      const refreshTokenFromCookie = req.cookies['refreshToken'];

      if (!(await this.cacheManager.get(id)) == refreshTokenFromCookie) {
        throw new UnauthorizedException();
      }

      const { email } = await this.jwtService.verify(refreshTokenFromCookie, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const accessToken = await this._createAccessToken(email);
      const refreshToken = await this._createRefreshToken(email, id);

      await this.cacheManager.del(id);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 24 * 60 * 60 * 1000 * 365,
        sameSite: 'strict',
        httpOnly: true,
        // secure: true
      });

      return {
        message: '토큰 재발급',
        accessToken,
      };
    } catch (error) {
      await this.cacheManager.del(id);
      res.cookie('refreshToken', '', {
        expires: new Date(1),
        httpOnly: true,
        secure: true,
      });
      throw new UnauthorizedException();
    }
  }

  async signOut(id): Promise<SignoutResponseDto> {
    await this.cacheManager.del(id);

    return {
      message: '로그아웃 성공',
    };
  }

  async findOne(id: number, user: User): Promise<UserFindResponseDto> {
    if (id !== user.id) {
      throw new ForbiddenException();
    }

    const { email, nickname } = await this.userRepository.findOne({
      where: { id },
    });

    return {
      message: '조회 성공',
      email,
      nickname,
    };
  }
}
