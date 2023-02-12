import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  readonly accessToken: string;
}

export class SignupResponseDto {
  @ApiProperty({
    example: '회원 가입 완료',
    description: '메세지',
  })
  readonly message: string;
}

export class SigninResponseDto {
  @ApiProperty({
    example: '로그인 성공',
    description: '메세지',
  })
  readonly message: string;

  @ApiProperty({
    example: 1,
    description: '유저 id',
  })
  readonly id: number;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFiY2RAZ21haWwuY29tIiwiaWF0IjoxNjczNzE3NzY0LCJleHAiOjE2NzM4MDQxNjR9.Dt-ZEi5usAKwNTcdp1UlXNcMJiaPwkkYsbJeMsCG0ec',
    description: '토큰',
  })
  readonly accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFiY2RAZ21haWwuY29tIiwiaWF0IjoxNjczNzE3NzY0LCJleHAiOjE2NzM4MDQxNjR9.Dt-ZEi5usAKwNTcdp1UlXNcMJiaPwkkYsbJeMsCG0ec',
    description: '리프레시 토큰',
  })
  readonly refreshToken: string;
}

export class UpdateAccessTokenResponseDto {
  @ApiProperty({
    example: '토큰 재발급 성공',
    description: '메세지',
  })
  readonly message: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFiY2RAZ21haWwuY29tIiwiaWF0IjoxNjczNzE3NzY0LCJleHAiOjE2NzM4MDQxNjR9.Dt-ZEi5usAKwNTcdp1UlXNcMJiaPwkkYsbJeMsCG0ec',
    description: '토큰',
  })
  readonly accessToken: string;
}

export class SignoutResponseDto {
  @ApiProperty({
    example: '로그아웃 성공',
    description: '메세지',
  })
  readonly message: string;
}

export class UserFindResponseDto {
  @ApiProperty({
    example: '조회 성공',
    description: '메세지',
  })
  readonly message: string;

  @ApiProperty({
    example: 1,
    description: '유저 id',
  })
  readonly email: string;

  @ApiProperty({
    example: '철수',
    description: '닉네임',
  })
  readonly nickname: string;
}
