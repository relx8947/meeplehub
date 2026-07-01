import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            欢迎来到 <span className="text-yellow-300">MeepleHub</span>
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            在浏览器里和好友或 AI 实时对弈经典桌游。
            选一款游戏,创建房间,即刻开局。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/games"
              className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              开始游戏
            </Link>
            <Link
              href="/rooms"
              className="bg-white/10 border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              对战大厅
            </Link>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            现在能玩什么?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <GameCard
              emoji="⚫"
              title="五子棋"
              description="15×15 棋盘,谁先连成五子谁就赢。规则简单,老少咸宜。"
            />
            <GameCard
              emoji="🔵"
              title="黑白棋"
              description="8×8 翻转对弈,夹住对手翻转棋子,终局比谁的子多。"
            />
          </div>
          <p className="text-center text-gray-400 mt-8 text-sm">
            支持「在线双人」与「人机对战」两种模式
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            如何开始
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <StepCard step={1} title="设置昵称" description="使用本次临时身份" />
            <StepCard step={2} title="挑选游戏" description="五子棋或黑白棋" />
            <StepCard step={3} title="创建房间" description="人机或邀请好友" />
            <StepCard step={4} title="实时对弈" description="落子即时同步" />
          </div>
        </div>
      </section>
    </div>
  );
}

function GameCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm">
        {emoji}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
        {step}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
