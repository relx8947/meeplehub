import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './room.entity';

interface SocketUser {
  id: string;
  nickname: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
      : true,
    credentials: true,
  },
  namespace: '/play',
})
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GameGateway');
  private readonly lobbyRoom = 'lobby';

  constructor(
    private readonly roomsService: RoomsService,
  ) {}

  async handleConnection(client: Socket) {
    const playerId =
      client.handshake.auth?.playerId ||
      (client.handshake.query?.playerId as string) ||
      '';
    if (!playerId) {
      client.data.user = null;
      return;
    }

    const nickname =
      this.decodeHeader(
        client.handshake.auth?.playerNickname ||
          (client.handshake.query?.playerNickname as string) ||
          '',
      ) || '匿名玩家';

    client.data.user = { id: playerId, nickname } as SocketUser;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(`room:${roomId}`);
    try {
      const room = await this.roomsService.findById(roomId);
      client.emit('room:state', this.serialize(room));
    } catch (e) {
      client.emit('room:error', { message: '房间不存在' });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.leave(`room:${roomId}`);
  }

  @SubscribeMessage('joinLobby')
  async handleJoinLobby(@ConnectedSocket() client: Socket) {
    client.join(this.lobbyRoom);
    client.emit('lobby:rooms', await this.serializeOpenRooms());
  }

  @SubscribeMessage('leaveLobby')
  handleLeaveLobby(@ConnectedSocket() client: Socket) {
    client.leave(this.lobbyRoom);
  }

  @SubscribeMessage('move')
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; row: number; col: number; pass?: boolean },
  ) {
    const user: SocketUser | null = client.data.user;
    if (!user) {
      client.emit('room:error', { message: '无法识别玩家身份,请刷新页面' });
      return;
    }
    try {
      const room = await this.roomsService.makeMove(data.roomId, user.id, {
        row: data.row,
        col: data.col,
        pass: data.pass,
      });
      this.broadcast(room);
      await this.broadcastLobbyRooms();
    } catch (e: any) {
      client.emit('room:error', { message: e.message || '操作失败' });
    }
  }

  @SubscribeMessage('restart')
  async handleRestart(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const user: SocketUser | null = client.data.user;
    if (!user) {
      client.emit('room:error', { message: '无法识别玩家身份,请刷新页面' });
      return;
    }
    try {
      const room = await this.roomsService.restart(roomId, user.id);
      this.broadcast(room);
      await this.broadcastLobbyRooms();
    } catch (e: any) {
      client.emit('room:error', { message: e.message || '操作失败' });
    }
  }

  /** Called by the controller after a REST join, to push updated state. */
  broadcast(room: Room) {
    this.server.to(`room:${room.id}`).emit('room:state', this.serialize(room));
  }

  broadcastRoomClosed(roomId: string) {
    this.server.to(`room:${roomId}`).emit('room:closed', {
      roomId,
      message: '房间已关闭',
    });
  }

  async broadcastLobbyRooms() {
    this.server.to(this.lobbyRoom).emit('lobby:rooms', await this.serializeOpenRooms());
  }

  private async serializeOpenRooms() {
    const rooms = await this.roomsService.findOpen();
    return rooms.map((room) => this.serialize(room));
  }

  private serialize(room: Room) {
    return {
      id: room.id,
      gameSlug: room.gameSlug,
      title: room.title,
      mode: room.mode,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players: room.players,
      boardState: room.boardState,
      boardSize: room.boardSize,
      currentTurnSeat: room.currentTurnSeat,
      winnerSeat: room.winnerSeat,
      isDraw: room.isDraw,
      hostUserId: room.hostUserId,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  private decodeHeader(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
}
