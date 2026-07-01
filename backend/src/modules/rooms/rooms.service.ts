import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Room, RoomStatus, RoomMode, RoomPlayer } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { MakeMoveDto } from './dto/make-move.dto';
import { getEngine, isValidGameSlug } from './engines';

export interface PlayerIdentity {
  userId: string;
  nickname: string;
}

export interface ReleasePlayerResult {
  deletedRoomIds: string[];
  finishedRooms: Room[];
}

@Injectable()
export class RoomsService {
  private readonly rooms = new Map<string, Room>();

  async create(
    user: PlayerIdentity,
    dto: CreateRoomDto,
  ): Promise<Room> {
    if (!isValidGameSlug(dto.gameSlug)) {
      throw new BadRequestException(`Unsupported game: ${dto.gameSlug}`);
    }
    const engine = getEngine(dto.gameSlug);
    const displayName = user.nickname;

    const host: RoomPlayer = {
      seat: 0,
      userId: user.userId,
      nickname: displayName,
      isAI: false,
    };

    const players: RoomPlayer[] = [host];
    let status = RoomStatus.WAITING;

    // AI mode: seat 1 is the bot, game starts immediately.
    if (dto.mode === RoomMode.AI) {
      players.push({ seat: 1, userId: null, nickname: '电脑 AI', isAI: true });
      status = RoomStatus.PLAYING;
    }

    const now = new Date().toISOString();
    const room: Room = {
      id: randomUUID(),
      gameSlug: dto.gameSlug,
      title: dto.title || `${displayName} 的房间`,
      mode: dto.mode,
      status,
      maxPlayers: 2,
      players,
      boardState: engine.createInitialBoard(),
      boardSize: engine.boardSize,
      currentTurnSeat: engine.firstTurnSeat(),
      winnerSeat: null,
      isDraw: false,
      hostUserId: user.userId,
      createdAt: now,
      updatedAt: now,
    };

    this.rooms.set(room.id, room);
    return this.cloneRoom(room);
  }

  async findOpen(): Promise<Room[]> {
    return Array.from(this.rooms.values())
      .filter(
        (room) =>
          room.mode === RoomMode.PVP &&
          [RoomStatus.WAITING, RoomStatus.PLAYING].includes(room.status),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50)
      .map((room) => this.cloneRoom(room));
  }

  async findById(id: string): Promise<Room> {
    const room = this.rooms.get(id);
    if (!room) {
      throw new NotFoundException('房间不存在');
    }
    return this.cloneRoom(room);
  }

  async join(
    roomId: string,
    user: PlayerIdentity,
  ): Promise<Room> {
    const room = this.getStoredRoom(roomId);
    if (room.mode === RoomMode.AI) {
      throw new BadRequestException('人机房间无法加入');
    }

    // Already seated? Idempotent — just return.
    if (room.players.some((p) => p.userId === user.userId)) {
      return this.cloneRoom(room);
    }

    if (room.players.length >= room.maxPlayers) {
      throw new ConflictException('房间已满');
    }

    room.players.push({
      seat: room.players.length,
      userId: user.userId,
      nickname: user.nickname,
      isAI: false,
    });

    if (room.players.length >= room.maxPlayers) {
      room.status = RoomStatus.PLAYING;
    }

    this.touch(room);
    return this.cloneRoom(room);
  }

  async makeMove(roomId: string, userId: string, dto: MakeMoveDto): Promise<Room> {
    const room = this.getStoredRoom(roomId);
    if (room.status !== RoomStatus.PLAYING) {
      throw new BadRequestException('对局未在进行中');
    }

    const player = room.players.find((p) => p.userId === userId);
    if (!player) throw new ForbiddenException('你不在该房间内');
    if (player.seat !== room.currentTurnSeat) {
      throw new BadRequestException('还没轮到你');
    }

    const engine = getEngine(room.gameSlug);
    const move = { row: dto.row, col: dto.col, pass: dto.pass };

    if (!engine.isLegalMove(room.boardState, player.seat, move)) {
      throw new BadRequestException('非法落子');
    }

    const applied = engine.applyMove(room.boardState, player.seat, move);
    room.boardState = applied.board;
    room.currentTurnSeat = applied.nextSeat;

    this.settleResult(room, engine);

    // AI auto-response loop (handles Reversi consecutive turns / passes).
    if (room.mode === RoomMode.AI) {
      this.runAiTurns(room, engine);
    }

    this.touch(room);
    return this.cloneRoom(room);
  }

  /** Restart a finished room with a fresh board (any seated player can trigger). */
  async restart(roomId: string, userId: string): Promise<Room> {
    const room = this.getStoredRoom(roomId);
    if (!room.players.some((p) => p.userId === userId)) {
      throw new ForbiddenException('你不在该房间内');
    }
    if (room.players.length < room.maxPlayers && room.mode === RoomMode.PVP) {
      throw new BadRequestException('对手尚未加入');
    }

    const engine = getEngine(room.gameSlug);
    room.boardState = engine.createInitialBoard();
    room.currentTurnSeat = engine.firstTurnSeat();
    room.winnerSeat = null;
    room.isDraw = false;
    room.status = RoomStatus.PLAYING;

    // If AI happens to move first (not the case for our games, but safe).
    if (room.mode === RoomMode.AI) {
      this.runAiTurns(room, engine);
    }

    this.touch(room);
    return this.cloneRoom(room);
  }

  async releasePlayer(userId: string): Promise<ReleasePlayerResult> {
    const deletedRoomIds: string[] = [];
    const finishedRooms: Room[] = [];

    for (const room of Array.from(this.rooms.values())) {
      const leavingPlayer = room.players.find((player) => player.userId === userId);
      if (!leavingPlayer || room.status === RoomStatus.FINISHED) continue;

      const remainingHumans = room.players.filter(
        (player) => !player.isAI && player.userId && player.userId !== userId,
      );

      if (room.mode === RoomMode.AI || room.status === RoomStatus.WAITING || remainingHumans.length === 0) {
        this.rooms.delete(room.id);
        deletedRoomIds.push(room.id);
        continue;
      }

      room.status = RoomStatus.FINISHED;
      room.winnerSeat = remainingHumans[0].seat;
      room.isDraw = false;
      this.touch(room);
      finishedRooms.push(this.cloneRoom(room));
    }

    return { deletedRoomIds, finishedRooms };
  }

  /** Evaluate terminal state and stamp winner/draw/status onto the room. */
  private settleResult(room: Room, engine: ReturnType<typeof getEngine>): void {
    const result = engine.getResult(room.boardState, room.currentTurnSeat);
    if (result.finished) {
      room.status = RoomStatus.FINISHED;
      room.winnerSeat = result.winnerSeat;
      room.isDraw = result.isDraw;
    }
  }

  /** While it's the AI's turn and the game is live, let the AI play. */
  private runAiTurns(room: Room, engine: ReturnType<typeof getEngine>): void {
    let guard = 0;
    while (room.status === RoomStatus.PLAYING && guard < 200) {
      guard++;
      const seat = room.currentTurnSeat;
      const seatPlayer = room.players.find((p) => p.seat === seat);
      if (!seatPlayer || !seatPlayer.isAI) break;

      const aiMove = engine.aiMove(room.boardState, seat);
      const move = aiMove ?? { row: -1, col: -1, pass: true };
      const applied = engine.applyMove(room.boardState, seat, move);
      room.boardState = applied.board;
      room.currentTurnSeat = applied.nextSeat;
      this.settleResult(room, engine);
    }
  }

  private getStoredRoom(roomId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new NotFoundException('房间不存在');
    return room;
  }

  private touch(room: Room): void {
    room.updatedAt = new Date().toISOString();
  }

  private cloneRoom(room: Room): Room {
    return JSON.parse(JSON.stringify(room)) as Room;
  }
}
