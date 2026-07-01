import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { GameGateway } from './game.gateway';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, GameGateway],
  exports: [RoomsService],
})
export class RoomsModule {}
