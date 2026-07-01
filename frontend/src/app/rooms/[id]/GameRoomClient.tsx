'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clearActiveRoom, rememberActiveRoom } from '@/lib/activeRoom';
import { Room } from '@/types';
import { usePlayerStore } from '@/store/player';
import { useGameSocket } from '@/hooks/useGameSocket';
import { GomokuBoard } from '@/components/play/GomokuBoard';
import { ReversiBoard } from '@/components/play/ReversiBoard';
import { ConnectFourBoard } from '@/components/play/ConnectFourBoard';
import { reversiLegalMoves, countDiscs } from '@/lib/reversi';
import { getGameNameZh, getModeLabel } from '@/lib/utils';

export function GameRoomClient({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { player, loadFromStorage } = usePlayerStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Live updates via WebSocket — directly consume room:state payloads.
  const { makeMove, restart } = useGameSocket({
    roomId,
    player,
    onState: (r) => setRoom(r),
    onError: (msg) => {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    },
    onClosed: (msg) => {
      clearActiveRoom(roomId);
      setRoom(null);
      setError(msg);
    },
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Initial fetch via REST (so the page works before the socket connects).
  useEffect(() => {
    api
      .get(`/rooms/${roomId}`)
      .then((res) => setRoom(res.data))
      .catch(() => setError('房间不存在'));
  }, [roomId]);

  useEffect(() => {
    if (!room || !player) return;

    const isSeated = room.players.some((p) => p.userId === player.id);
    if (isSeated && room.status !== 'finished') {
      rememberActiveRoom(room);
    }
    if (room.status === 'finished') {
      clearActiveRoom(room.id);
    }
  }, [room, player]);

  const mySeat = room?.players.find((p) => p.userId === player?.id)?.seat ?? null;
  const isInRoom = mySeat !== null;
  const isHost = Boolean(room && player?.id === room.hostUserId);
  const canJoin =
    room &&
    room.mode === 'pvp' &&
    !isInRoom &&
    room.players.length < room.maxPlayers &&
    room.status !== 'finished';
  const canLeave = Boolean(room && isInRoom && room.status !== 'finished');
  const leaveLabel =
    room?.status === 'playing'
      ? '投降离开'
      : isHost
        ? '关闭房间'
        : '离开房间';

  const handleJoin = useCallback(async () => {
    setJoining(true);
    try {
      const res = await api.post(`/rooms/${roomId}/join`);
      rememberActiveRoom(res.data);
      setRoom(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '加入失败');
    } finally {
      setJoining(false);
    }
  }, [roomId]);

  const handlePlace = useCallback(
    (r: number, c: number) => {
      makeMove(r, c, false);
    },
    [makeMove],
  );

  const handleLeave = useCallback(async () => {
    if (!room) return;

    setLeaving(true);
    try {
      await api.post(`/rooms/${roomId}/leave`);
      clearActiveRoom(roomId);
      router.push('/rooms');
    } catch (err: any) {
      setError(err.response?.data?.message || '离开房间失败');
    } finally {
      setLeaving(false);
    }
  }, [room, roomId, router]);

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        {error ? (
          <h1 className="text-2xl font-bold text-gray-900">{error}</h1>
        ) : (
          <div className="animate-pulse text-gray-400">加载房间中...</div>
        )}
      </div>
    );
  }

  const isMyTurn = isInRoom && room.status === 'playing' && room.currentTurnSeat === mySeat;
  const boardDisabled = !isMyTurn;

  // Turn / result banner
  const banner = renderBanner(room, mySeat, isMyTurn);

  // Reversi: compute legal moves for the current player to highlight.
  const legalMoves =
    room.gameSlug === 'reversi' && isMyTurn && mySeat !== null
      ? reversiLegalMoves(room.boardState, mySeat === 0 ? 1 : 2)
      : [];
  const mustPass =
    room.gameSlug === 'reversi' && isMyTurn && legalMoves.length === 0 && room.status === 'playing';

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/rooms" className="hover:text-primary-600">对战大厅</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{room.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Board */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="mb-4 w-full">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              {getGameNameZh(room.gameSlug)}
              <span className="text-sm font-normal text-gray-400 ml-2">
                {getModeLabel(room.mode)}
              </span>
            </h1>
          </div>

          {/* Banner */}
          <div className="mb-4 min-h-[2.5rem] flex items-center justify-center">
            {banner}
          </div>

          {error && (
            <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {room.gameSlug === 'gomoku' ? (
            <GomokuBoard board={room.boardState} onPlace={handlePlace} disabled={boardDisabled} />
          ) : room.gameSlug === 'reversi' ? (
            <ReversiBoard
              board={room.boardState}
              legalMoves={legalMoves}
              onPlace={handlePlace}
              disabled={boardDisabled}
            />
          ) : (
            <ConnectFourBoard
              board={room.boardState}
              onPlace={handlePlace}
              disabled={boardDisabled}
            />
          )}

          {/* Pass button for Reversi when no legal move */}
          {mustPass && (
            <button
              onClick={() => makeMove(-1, -1, true)}
              className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-600"
            >
              无子可下,跳过回合
            </button>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {canJoin && (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {joining ? '加入中...' : '加入对战'}
              </button>
            )}
            {isInRoom && room.status === 'finished' && (
              <button
                onClick={restart}
                className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-700"
              >
                再来一局
              </button>
            )}
            {canLeave && (
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="border border-red-200 bg-white px-8 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {leaving ? '处理中...' : leaveLabel}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">对局信息</h3>

            <PlayerRow room={room} seat={0} mySeat={mySeat} />
            <div className="my-3 text-center text-xs text-gray-400">VS</div>
            <PlayerRow room={room} seat={1} mySeat={mySeat} />

            {room.gameSlug === 'reversi' && (
              <div className="mt-6 pt-4 border-t flex justify-around text-center">
                <div>
                  <div className="w-6 h-6 rounded-full bg-black mx-auto mb-1" />
                  <p className="text-sm font-medium">{countDiscs(room.boardState).black}</p>
                </div>
                <div>
                  <div className="w-6 h-6 rounded-full bg-white border border-gray-300 mx-auto mb-1" />
                  <p className="text-sm font-medium">{countDiscs(room.boardState).white}</p>
                </div>
              </div>
            )}

            {room.status === 'waiting' && (
              <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
                等待对手加入...
                <p className="text-xs text-gray-400 mt-2">把本页链接发给好友即可一起玩</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <p className="text-xs font-medium text-gray-400 mb-2">当前身份</p>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm font-medium text-gray-900">
                  {player?.nickname || '临时玩家'}
                </span>
                <span className="text-xs text-gray-500">
                  {mySeat === null ? '观战' : getSeatLabel(room.gameSlug, mySeat)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ room, seat, mySeat }: { room: Room; seat: number; mySeat: number | null }) {
  const player = room.players.find((p) => p.seat === seat);
  const isTurn = room.status === 'playing' && room.currentTurnSeat === seat;
  const pieceColor = getPieceColor(room.gameSlug, seat);

  return (
    <div
      className={`flex items-center p-3 rounded-lg ${
        isTurn ? 'bg-primary-50 ring-1 ring-primary-200' : 'bg-gray-50'
      }`}
    >
      <div className={`w-6 h-6 rounded-full ${pieceColor} mr-3`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {player ? player.nickname : '等待加入...'}
          {player && mySeat === seat && <span className="text-primary-600 ml-1">(你)</span>}
        </p>
        <p className="text-xs text-gray-400">{getSeatLabel(room.gameSlug, seat)}</p>
      </div>
      {isTurn && (
        <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full animate-pulse">
          行动中
        </span>
      )}
    </div>
  );
}

function renderBanner(room: Room, mySeat: number | null, isMyTurn: boolean) {
  if (room.status === 'finished') {
    if (room.isDraw) {
      return <span className="text-lg font-bold text-gray-600">平局!</span>;
    }
    const iWon = mySeat !== null && room.winnerSeat === mySeat;
    const winnerName = room.players.find((p) => p.seat === room.winnerSeat)?.nickname;
    if (mySeat !== null) {
      return (
        <span className={`text-lg font-bold ${iWon ? 'text-green-600' : 'text-red-500'}`}>
          {iWon ? '🎉 你赢了!' : '😔 你输了'}
        </span>
      );
    }
    return <span className="text-lg font-bold text-gray-700">🏆 {winnerName} 获胜</span>;
  }

  if (room.status === 'waiting') {
    return <span className="text-gray-500">等待对手加入...</span>;
  }

  // playing
  if (isMyTurn) {
    return <span className="text-lg font-bold text-primary-600">轮到你了,请落子</span>;
  }
  const current = room.players.find((p) => p.seat === room.currentTurnSeat);
  return <span className="text-gray-500">等待 {current?.nickname || '对手'} 落子...</span>;
}

function getSeatLabel(gameSlug: string, seat: number): string {
  if (gameSlug === 'connect-four') {
    return seat === 0 ? '红棋 · 先手' : '黄棋 · 后手';
  }
  return seat === 0 ? '黑棋 · 先手' : '白棋 · 后手';
}

function getPieceColor(gameSlug: string, seat: number): string {
  if (gameSlug === 'connect-four') {
    return seat === 0 ? 'bg-red-500' : 'bg-yellow-300 border border-yellow-400';
  }
  return seat === 0 ? 'bg-black' : 'bg-white border border-gray-300';
}
