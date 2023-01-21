import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(100)
  @ApiProperty({
    example: 'foo@bar.com',
    description: '이메일',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(100)
  @ApiProperty({
    example: 'abcd1234!',
    description: '패스워드',
    required: true,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  @ApiProperty({
    example: '철수',
    description: '닉네임',
    required: true,
  })
  nickname: string;
}

export class SigninRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(100)
  @ApiProperty({
    example: 'foo@bar.com',
    description: '닉네임',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(100)
  @ApiProperty({
    example: 'abcd1234!',
    description: '패스워드',
    required: true,
  })
  password: string;
}
