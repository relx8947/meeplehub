import { Module } from '@nestjs/common';
import { GamesModule } from './modules/games/games.module';
import { RoomsModule } from './modules/rooms/rooms.module';

@Module({
  imports: [
    GamesModule,
    RoomsModule,
  ],
})
export class AppModule {}
