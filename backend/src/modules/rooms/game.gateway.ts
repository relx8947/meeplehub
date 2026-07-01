import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ReleasePlayerResult, RoomsService } from './rooms.service';
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
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GameGateway');
  private readonly lobbyRoom = 'lobby';
  private readonly playerSockets = new Map<string, Set<string>>();
  private readonly inactiveTimeoutMs = Number(process.env.ROOM_INACTIVE_TIMEOUT_MS || 10 * 60 * 1000);
  private readonly cleanupIntervalMs = Number(process.env.ROOM_CLEANUP_INTERVAL_MS || 30 * 1000);
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly roomsService: RoomsService,
  ) {}

  onModuleInit() {
    this.cleanupTimer = setInterval(() => {
      void this.cleanupInactivePlayers();
    }, this.cleanupIntervalMs);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

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
    this.addPlayerSocket(playerId, client.id);
    this.roomsService.recordPlayerConnected(playerId, true);
  }

  handleDisconnect(client: Socket) {
    const user: SocketUser | null = client.data.user;
    if (!user) return;

    if (this.removePlayerSocket(user.id, client.id) === 0) {
      this.roomsService.recordPlayerConnected(user.id, false);
    }
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

  async broadcastLifecycle(result: ReleasePlayerResult) {
    const changedRooms = [...result.updatedRooms, ...result.finishedRooms];
    for (const room of changedRooms) {
      this.broadcast(room);
    }
    for (const roomId of result.deletedRoomIds) {
      this.broadcastRoomClosed(roomId);
    }

    if (changedRooms.length > 0 || result.deletedRoomIds.length > 0) {
      await this.broadcastLobbyRooms();
    }
  }

  private async cleanupInactivePlayers() {
    const result = this.roomsService.sweepInactivePlayers(this.inactiveTimeoutMs);
    const changedCount =
      result.deletedRoomIds.length + result.finishedRooms.length + result.updatedRooms.length;
    if (changedCount === 0) return;

    this.logger.log(`Cleaned up ${changedCount} room lifecycle change(s) for inactive players`);
    await this.broadcastLifecycle(result);
  }

  private addPlayerSocket(playerId: string, socketId: string) {
    const sockets = this.playerSockets.get(playerId) || new Set<string>();
    sockets.add(socketId);
    this.playerSockets.set(playerId, sockets);
  }

  private removePlayerSocket(playerId: string, socketId: string): number {
    const sockets = this.playerSockets.get(playerId);
    if (!sockets) return 0;

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.playerSockets.delete(playerId);
      return 0;
    }

    return sockets.size;
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
