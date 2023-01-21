import {
  ConflictException,
  ForbiddenException,
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
  SignupResponseDto,
  UserFindResponseDto,
} from './dto/user.response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

  async signIn(req: SigninRequestDto): Promise<SigninResponseDto> {
    const { email, password } = req;

    const user = await this.userRepository.findOne({ where: { email } });
    const accessToken = await this.jwtService.sign({ email });
    const id = user?.id;

    if (!user) {
      throw new NotFoundException('이메일을 확인해 주세요.');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해 주세요.');
    }

    return {
      message: '로그인 성공',
      id,
      accessToken,
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
