import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Get,
  Req,
  Res,
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
import { Request, Response } from 'express';
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
  SignoutResponseDto,
  SignupResponseDto,
  UpdateAccessTokenResponseDto,
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
  @Post('/signup')
  async signUp(@Body() req: SignupRequestDto): Promise<SignupResponseDto> {
    return await this.userService.signUp(req);
  }

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
  @Post('/signin')
  async singIn(
    @Body() req: SigninRequestDto,
    @Res() res: Response,
  ): Promise<Response<Partial<SigninResponseDto>, Record<string, any>>> {
    const response = await this.userService.signIn(req);
    const { refreshToken, accessToken } = response;

    res.cookie('refreshToken', refreshToken, {
      maxAge: 24 * 60 * 60 * 1000 * 365,
      sameSite: 'strict',
      httpOnly: true,
      // secure: true
    });

    return res.send({
      message: '로그인 성공',
      id: response.id,
      accessToken: accessToken,
    });
  }

  @Get('refresh/:id')
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiOkResponse({
    description: '재발급 성공',
    type: UpdateAccessTokenResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: UnauthorizedExceptionDto,
  })
  async updateAccessToken(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<Response<UpdateAccessTokenResponseDto>> {
    const { message, accessToken } = await this.userService.updateAccessToken(
      req,
      res,
      id,
    );

    return res.send({
      message,
      accessToken,
    });
  }

  @Post('/:id/signout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth()
  @ApiSecurity('access-token')
  @ApiOkResponse({
    description: '로그아웃 성공',
    type: SignoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: UnauthorizedExceptionDto,
  })
  @UseGuards(AuthGuard())
  async signout(@Param() id: string): Promise<SignoutResponseDto> {
    return await this.userService.signOut(+id);
  }

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
  @Get('/:id')
  @UseGuards(AuthGuard())
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Token() user: User,
  ): Promise<UserFindResponseDto> {
    return await this.userService.findOne(id, user);
  }
}
