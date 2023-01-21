import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Token } from 'src/common/auth/token.decorator';
import {
  BadRequestExceptionDto,
  ConfilctEmailExceptionDto,
  InternalServerErrorExceptionDto,
  NotFoundExceptionDto,
  TooManyRequestExceptionDto,
  UnauthorizedExceptionDto,
} from 'src/common/dto/exception.dto';
import { User } from 'src/entities/user.entity';
import { SigninRequestDto, SignupRequestDto } from './dto/user.request.dto';
import {
  SigninResponseDto,
  SignupResponseDto,
  UserFindResponseDto,
} from './dto/user.response.dto';
import { UserService } from './user.service';

@ApiTags('회원 API')
@ApiTooManyRequestsResponse({
  description: 'API 요청 횟수 초과',
  type: TooManyRequestExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: '서버 에러',
  type: InternalServerErrorExceptionDto,
})
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    type: SignupResponseDto,
  })
  @ApiBadRequestResponse({
    description: '유효성 검사 실패',
    type: BadRequestExceptionDto,
  })
  @ApiConflictResponse({
    description: '이메일 중복',
    type: ConfilctEmailExceptionDto,
  })
  async signUp(@Body() req: SignupRequestDto): Promise<SignupResponseDto> {
    return await this.userService.signUp(req);
  }

  @Post('/signin')
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({
    description: '로그인 성공',
    type: SigninResponseDto,
  })
  @ApiBadRequestResponse({
    description: '유효성 검사 실패',
    type: BadRequestExceptionDto,
  })
  @ApiNotFoundResponse({
    description: '조회 실패',
    type: NotFoundExceptionDto,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: UnauthorizedExceptionDto,
  })
  async singIn(@Body() req: SigninRequestDto): Promise<SigninResponseDto> {
    return await this.userService.signIn(req);
  }

  @Get('/:id')
  @ApiOperation({ summary: '프로필 조회' })
  @ApiBearerAuth()
  @ApiSecurity('access-token')
  @ApiOkResponse({
    description: '프로필 조회 성공',
    type: UserFindResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: UnauthorizedExceptionDto,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: '유저 id',
    example: 1,
    required: true,
  })
  @UseGuards(AuthGuard())
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Token() user: User,
  ): Promise<UserFindResponseDto> {
    return await this.userService.findOne(id, user);
  }
}
