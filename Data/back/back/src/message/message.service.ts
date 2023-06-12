import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { CreateMessage } from './dto/message.dto';
import { Chat } from 'src/chat/chat.entity';
import { User } from 'src/user/user.entity';
import { createNewMessage, validateMessage } from './message.utils';

//https://typeorm.io/find-options

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async getMessageByUserId(ID: number) {
    const message = await this.messageRepo.find({
      order: {
        // get messages in ascending order
        id: 'asc',
      },
      relations: {
        // load the userId and chatroom entity in a singel query
        userId: true,
        chatRoomId: true,
      },
      where: {
        // only care bout the with the passed ID
        userId: {
          id: ID,
        },
      },
      select: {
        // we only care about these values
        userId: {
          id: true,
          userName: true,
        },
        chatRoomId: {
          id: true,
          chatRoomName: true,
          type: true,
        },
        value: true,
      },
      cache: true, // store resoltes in memory for future use
    });
    if (message.length !== 0) {
      console.log('message ==', message);
      return message;
    }
    throw new NotFoundException(`No messages found for user ${ID}`);
  }
  async create(
    messageDTO: CreateMessage,
    chatRoom: Chat,
    user: User,
  ): Promise<Message> {
    if (validateMessage(messageDTO.value) == false)
      throw new BadRequestException('connot send enpty message');
    const message = createNewMessage(messageDTO.value, chatRoom, user);
    return this.messageRepo.save(message);
  }
} // END OF MessageService Class
