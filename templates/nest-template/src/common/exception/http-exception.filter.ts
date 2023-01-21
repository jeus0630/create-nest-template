import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const slack = require('../notification/notification');

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const { url } = req;

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
      exception = new InternalServerErrorException(
        `Name: ${exception.name}
        Message: ${exception.message}`,
      );
    }

    if ((exception as HttpException).getStatus() === 500) {
      const slackError = {
        slackErrorColor: '#ff0000',
        slackErrorType: 'Internal Server Error',
        slackErrorMessage: `
        URL: ${url}
        ${exception.message}
        Time: ${new Date(
          new Date().getTime() +
            new Date().getTimezoneOffset() * 60 * 1000 +
            9 * 60 * 60 * 1000,
        )}
        Stack: ${exception.stack}   
        `,
      };

      this.sendSlackMessage(slackError);
    }

    const response = (exception as HttpException).getResponse();
    const stack = exception.stack;

    const log = {
      url,
      response,
      stack,
    };

    this.logger.error(log);

    res.status((exception as HttpException).getStatus()).json(response);
  }

  sendSlackMessage({
    slackErrorColor,
    slackErrorType,
    slackErrorMessage,
  }: {
    slackErrorColor: string;
    slackErrorType: string;
    slackErrorMessage: string;
  }) {
    slack.slackMessage(slackErrorColor, slackErrorType, slackErrorMessage);
  }
}
