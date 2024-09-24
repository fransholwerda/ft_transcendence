import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    BadRequestException,
  } from '@nestjs/common';
  import { WsException } from '@nestjs/websockets';
  
  @Catch(BadRequestException)
  export class WsValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
      const ctx = host.switchToWs();
      const client = ctx.getClient();
  
      // Extract validation error details from the exception
      const response = exception.getResponse();
      const message = response['message'];
  
      // Emit the error message back to the client
      client.emit('chatAlert', { message: message });
    }
  }