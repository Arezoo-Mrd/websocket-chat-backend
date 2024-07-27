import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { IsNotEmpty, IsString, ValidationError } from 'class-validator';
import { Server } from 'socket.io';
import { WebsocketExeptionsFilter } from 'src/exeptions/ws-exeptions.filter';

class ChatMessage {
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(new WebsocketExeptionsFilter())
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('text-chat')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        console.log('🚀 ~ ChatGateway ~ errors:', errors);
        return errors;
      },
    }),
  )
  handleMessage(@MessageBody() message: ChatMessage) {
    console.log('🚀 ~ ChatGateway ~ handleMessage ~ message:', message);
    this.server.emit('text-chat', {
      ...message,
      time: new Date().toDateString(),
    });

    return message;
  }
}
