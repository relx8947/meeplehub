'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/player';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { player, renameIdentity, resetIdentity } = usePlayerStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [switchingIdentity, setSwitchingIdentity] = useState(false);

  const navLinks = [
    { href: '/games', label: '游戏大厅' },
    { href: '/rooms', label: '对战房间' },
  ];

  useEffect(() => {
    setNicknameDraft(player?.nickname || '');
  }, [player?.nickname]);

  const saveNickname = () => {
    renameIdentity(nicknameDraft);
    setEditingName(false);
  };

  const switchIdentity = async () => {
    setSwitchingIdentity(true);
    try {
      await resetIdentity();
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setEditingName(false);
    } finally {
      setSwitchingIdentity(false);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MeepleHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === link.href || pathname?.startsWith(link.href + '/')
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Temporary identity */}
          <div className="hidden md:flex items-center space-x-4">
            {editingName ? (
              <form
                className="flex items-center space-x-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveNickname();
                }}
              >
                <input
                  value={nicknameDraft}
                  onChange={(event) => setNicknameDraft(event.target.value)}
                  autoFocus
                  maxLength={20}
                  className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  保存
                </button>
              </form>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setEditingName(true)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-xs">
                      {(player?.nickname || '临').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{player?.nickname || '临时玩家'}</span>
                </button>
                <button
                  onClick={switchIdentity}
                  disabled={switchingIdentity}
                  className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  {switchingIdentity ? '切换中...' : '换身份'}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t pt-3">
              <label className="block text-xs text-gray-400 mb-1">临时昵称</label>
              <div className="flex gap-2">
                <input
                  value={nicknameDraft}
                  onChange={(event) => setNicknameDraft(event.target.value)}
                  maxLength={20}
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={saveNickname}
                  className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white"
                >
                  保存
                </button>
              </div>
              <button
                onClick={switchIdentity}
                disabled={switchingIdentity}
                className="mt-2 block py-2 text-sm text-gray-500 disabled:opacity-50"
              >
                {switchingIdentity ? '切换中...' : '换一个临时身份'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
