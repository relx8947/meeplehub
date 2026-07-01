import { Game } from './game.entity';

/**
 * Playable games in the catalog.
 * `slug` must match a game engine in modules/rooms/engines.
 */
export const PLAYABLE_GAMES: Game[] = [
  {
    id: 'gomoku',
    slug: 'gomoku',
    name: 'Gomoku',
    nameZh: '五子棋',
    description: 'A classic two-player connection game. Place stones on a 15x15 grid and be the first to line up five in a row.',
    descriptionZh:
      '目标:在 15×15 的棋盘上,率先把自己的五颗棋子连成一条线(横、竖、斜均可)。\n怎么玩:黑方先手,双方轮流在棋盘的空交叉点上落子。每次只能落一子,落子后不可移动。\n获胜:任意方向(水平、垂直、对角线)率先连成五子者获胜;棋盘填满仍无人连成五子则为平局。\n小贴士:进攻的同时要留意封堵对手的「活四」「活三」,攻防兼顾才能取胜。',
    coverImage: '',
    minPlayers: 2,
    maxPlayers: 2,
    minPlaytime: 5,
    maxPlaytime: 15,
    difficulty: 'beginner',
    categories: ['策略', '棋类', '双人'],
    boardSize: 15,
    isPlayable: true,
    supportsAI: true,
    sortOrder: 1,
  },
  {
    id: 'reversi',
    slug: 'reversi',
    name: 'Reversi (Othello)',
    nameZh: '黑白棋',
    description: 'Also known as Othello. Outflank your opponent on an 8x8 board to flip their discs, and hold the majority when the board fills up.',
    descriptionZh:
      '目标:在 8×8 的棋盘上,当棋盘下满或双方都无子可下时,盘面上自己颜色的棋子更多者获胜。\n怎么玩:黑方先手,棋盘中央初始有黑白各两子。落子必须能「夹住」对手的一段连续棋子(横、竖、斜任一方向),被夹住的对方棋子全部翻转为己方颜色。\n规则要点:只能落在能翻转对手棋子的位置;若当前方无合法落子,则必须「跳过」由对手继续;双方都无子可下时对局结束。\n小贴士:四个角是兵家必争之地——占到角的棋子永远不会被翻转。',
    coverImage: '',
    minPlayers: 2,
    maxPlayers: 2,
    minPlaytime: 10,
    maxPlaytime: 20,
    difficulty: 'intermediate',
    categories: ['策略', '棋类', '双人'],
    boardSize: 8,
    isPlayable: true,
    supportsAI: true,
    sortOrder: 2,
  },
  {
    id: 'connect-four',
    slug: 'connect-four',
    name: 'Connect Four',
    nameZh: '四子棋',
    description: 'Drop discs into a vertical grid and be the first to connect four in a row horizontally, vertically, or diagonally.',
    descriptionZh:
      '目标:在 6×7 的竖立棋盘中,率先让自己的四枚棋子连成一条线(横、竖、斜均可)。\n怎么玩:双方轮流选择一列投入棋子,棋子会落到该列最底部的空位。每次只能选择未满的一列。\n获胜:任意方向率先形成四连者获胜;棋盘填满仍无人四连则为平局。\n小贴士:中间列更容易向多个方向展开攻势,同时要留意对手下一手是否能直接四连。',
    coverImage: '',
    minPlayers: 2,
    maxPlayers: 2,
    minPlaytime: 5,
    maxPlaytime: 10,
    difficulty: 'beginner',
    categories: ['策略', '棋类', '双人'],
    boardSize: 7,
    isPlayable: true,
    supportsAI: true,
    sortOrder: 3,
  },
];
