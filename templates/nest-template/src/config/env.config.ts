import { ConfigModuleOptions } from '@nestjs/config';

export const envConfig: ConfigModuleOptions = {
  envFilePath: [`.${process.env.NODE_ENV}.env`],
};
