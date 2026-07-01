import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { GameGateway } from './game.gateway';
import { CreateRoomDto } from './dto/create-room.dto';
import { MakeMoveDto } from './dto/make-move.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly gameGateway: GameGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取开放对战房间列表' })
  async findOpen() {
    return this.roomsService.findOpen();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取房间详情' })
  async findById(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建对战房间' })
  async create(@Req() request: Request, @Body() dto: CreateRoomDto) {
    const room = await this.roomsService.create(this.readPlayer(request), dto);
    await this.gameGateway.broadcastLobbyRooms();
    return room;
  }

  @Post('players/me/release')
  @ApiOperation({ summary: '释放当前临时身份占用的房间' })
  async releasePlayer(@Req() request: Request) {
    const result = await this.roomsService.releasePlayer(this.readPlayer(request).userId);

    for (const room of result.finishedRooms) {
      this.gameGateway.broadcast(room);
    }
    for (const roomId of result.deletedRoomIds) {
      this.gameGateway.broadcastRoomClosed(roomId);
    }
    await this.gameGateway.broadcastLobbyRooms();

    return {
      deletedRoomIds: result.deletedRoomIds,
      finishedRoomIds: result.finishedRooms.map((room) => room.id),
    };
  }

  @Post(':id/join')
  @ApiOperation({ summary: '加入房间' })
  async join(@Param('id') id: string, @Req() request: Request) {
    const room = await this.roomsService.join(id, this.readPlayer(request));
    // Push updated state to anyone already in the room via WebSocket.
    this.gameGateway.broadcast(room);
    await this.gameGateway.broadcastLobbyRooms();
    return room;
  }

  @Post(':id/move')
  @ApiOperation({ summary: '落子(REST 备用,主路径走 WebSocket)' })
  async move(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() dto: MakeMoveDto,
  ) {
    const room = await this.roomsService.makeMove(id, this.readPlayer(request).userId, dto);
    this.gameGateway.broadcast(room);
    await this.gameGateway.broadcastLobbyRooms();
    return room;
  }

  private readPlayer(request: Request) {
    const userId = this.headerValue(request, 'x-player-id');
    if (!userId) {
      return {
        userId: `anon-${Math.random().toString(36).slice(2, 10)}`,
        nickname: '匿名玩家',
      };
    }

    return {
      userId,
      nickname: this.decodeHeader(this.headerValue(request, 'x-player-nickname')) || '匿名玩家',
    };
  }

  private headerValue(request: Request, name: string): string {
    const value = request.headers[name];
    return Array.isArray(value) ? value[0] || '' : value || '';
  }

  private decodeHeader(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
}
