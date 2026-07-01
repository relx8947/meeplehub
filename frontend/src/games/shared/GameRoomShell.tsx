'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Room } from '@/types';
import { getGameNameZh, getModeLabel } from '@/lib/utils';
import { RoomSession } from './useRoomSession';

type ActiveRoomSession = RoomSession & { room: Room };

interface GameRoomShellProps {
  session: RoomSession;
  renderBoard: (session: ActiveRoomSession) => ReactNode;
  actionsExtra?: (session: ActiveRoomSession) => ReactNode;
  sidebarExtra?: (session: ActiveRoomSession) => ReactNode;
}

export function GameRoomShell({
  session,
  renderBoard,
  actionsExtra,
  sidebarExtra,
}: GameRoomShellProps) {
  if (!session.room) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        {session.error ? (
          <h1 className="text-2xl font-bold text-gray-900">{session.error}</h1>
        ) : (
          <div className="animate-pulse text-gray-400">加载房间中...</div>
        )}
      </div>
    );
  }

  const activeSession = session as ActiveRoomSession;
  const { room } = activeSession;
  const banner = renderBanner(room, session.mySeat, session.isMyTurn);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/rooms" className="hover:text-primary-600">对战大厅</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{room.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col items-center lg:col-span-2">
          <div className="mb-4 w-full">
            <h1 className="text-center text-2xl font-bold text-gray-900">
              {getGameNameZh(room.gameSlug)}
              <span className="ml-2 text-sm font-normal text-gray-400">
                {getModeLabel(room.mode)}
              </span>
            </h1>
          </div>

          <div className="mb-4 flex min-h-[2.5rem] items-center justify-center">
            {banner}
          </div>

          {session.error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {session.error}
            </div>
          )}

          {renderBoard(activeSession)}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {actionsExtra?.(activeSession)}
            {session.canJoin && (
              <button
                onClick={session.joinRoom}
                disabled={session.joining}
                className="rounded-lg bg-primary-600 px-8 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {session.joining ? '加入中...' : '加入对战'}
              </button>
            )}
            {session.isInRoom && room.status === 'finished' && (
              <button
                onClick={session.restart}
                className="rounded-lg bg-primary-600 px-8 py-2.5 font-medium text-white hover:bg-primary-700"
              >
                再来一局
              </button>
            )}
            {session.canLeave && (
              <button
                onClick={session.leaveRoom}
                disabled={session.leaving}
                className="rounded-lg border border-red-200 bg-white px-8 py-2.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {session.leaving ? '处理中...' : session.leaveLabel}
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">对局信息</h3>

            <PlayerRow room={room} seat={0} mySeat={session.mySeat} />
            <div className="my-3 text-center text-xs text-gray-400">VS</div>
            <PlayerRow room={room} seat={1} mySeat={session.mySeat} />

            {sidebarExtra?.(activeSession)}

            {room.status === 'waiting' && (
              <div className="mt-6 border-t pt-4 text-center text-sm text-gray-500">
                等待对手加入...
                <p className="mt-2 text-xs text-gray-400">把本页链接发给好友即可一起玩</p>
              </div>
            )}

            <div className="mt-6 border-t pt-4">
              <p className="mb-2 text-xs font-medium text-gray-400">当前身份</p>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm font-medium text-gray-900">
                  {session.player?.nickname || '临时玩家'}
                </span>
                <span className="text-xs text-gray-500">
                  {session.mySeat === null
                    ? '观战'
                    : getSeatLabel(room.gameSlug, session.mySeat)}
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
      className={`flex items-center rounded-lg p-3 ${
        isTurn ? 'bg-primary-50 ring-1 ring-primary-200' : 'bg-gray-50'
      }`}
    >
      <div className={`mr-3 h-6 w-6 rounded-full ${pieceColor}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {player ? player.nickname : '等待加入...'}
          {player && mySeat === seat && <span className="ml-1 text-primary-600">(你)</span>}
        </p>
        <p className="text-xs text-gray-400">{getSeatLabel(room.gameSlug, seat)}</p>
      </div>
      {isTurn && (
        <span className="rounded-full bg-primary-600 px-2 py-1 text-xs text-white">
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
          {iWon ? '你赢了!' : '你输了'}
        </span>
      );
    }
    return <span className="text-lg font-bold text-gray-700">{winnerName} 获胜</span>;
  }

  if (room.status === 'waiting') {
    return <span className="text-gray-500">等待对手加入...</span>;
  }

  if (isMyTurn) {
    return <span className="text-lg font-bold text-primary-600">轮到你了,请行动</span>;
  }
  const current = room.players.find((p) => p.seat === room.currentTurnSeat);
  return <span className="text-gray-500">等待 {current?.nickname || '对手'} 行动...</span>;
}

function getSeatLabel(gameSlug: string, seat: number): string {
  if (gameSlug === 'connect-four') {
    return seat === 0 ? '红棋 · 先手' : '黄棋 · 后手';
  }
  return seat === 0 ? '黑棋 · 先手' : '白棋 · 后手';
}

function getPieceColor(gameSlug: string, seat: number): string {
  if (gameSlug === 'connect-four') {
    return seat === 0 ? 'bg-red-500' : 'border border-yellow-400 bg-yellow-300';
  }
  return seat === 0 ? 'bg-black' : 'border border-gray-300 bg-white';
}
