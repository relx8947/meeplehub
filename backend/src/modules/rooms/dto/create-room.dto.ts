import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomMode } from '../room.entity';

export class CreateRoomDto {
  @ApiProperty({ example: 'gomoku', description: 'Game slug: gomoku | reversi' })
  @IsString()
  gameSlug: string;

  @ApiProperty({ enum: RoomMode, example: RoomMode.PVP })
  @IsEnum(RoomMode)
  mode: RoomMode;

  @ApiPropertyOptional({ example: '来一局五子棋' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;
}
