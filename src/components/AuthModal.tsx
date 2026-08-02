import React, { useState } from 'react';
import { User } from '../types';
import { X, ShieldCheck, PenTool, User as UserIcon, Lock, Mail, LogOut } from 'lucide-react';
import { loginUser } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = async (role: 'admin' | 'author' | 'user') => {
    setLoading(true);
    try {
      const demoUsername = role === 'admin' ? 'admin' : role === 'author' ? 'author_reza' : 'user_ali';
      const res = await loginUser(demoUsername, role);
      if (res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const res = await loginUser(username);
      if (res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        {currentUser ? (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-blue-500 p-1 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-slate-500" />
              )}
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{currentUser.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{currentUser.email || currentUser.username}</p>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mb-6">
              نقش: {currentUser.role === 'admin' ? 'مدیر کل سیستم' : currentUser.role === 'author' ? 'نویسنده' : 'کاربر عادی'}
            </span>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLogoutClick}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج کامل از حساب کاربری</span>
              </button>

              <p className="text-[11px] text-slate-400">یا تغییر حساب کاربری با ورود مجدد:</p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex flex-col items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>ورود به مدیر</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('author')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex flex-col items-center gap-1"
                >
                  <PenTool className="w-3.5 h-3.5 text-purple-600" />
                  <span>ورود به نویسنده</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('user')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex flex-col items-center gap-1"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                  <span>کاربر عادی</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black">ورود به حساب کاربری</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ورود جهت ارسال دیدگاه، ذخیره نشان‌شده‌ها و دسترسی به پنل نویسندگان
              </p>
            </div>

            {/* Quick Demo Access Buttons */}
            <div className="mb-6 p-3 rounded-2xl bg-blue-50 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-extrabold text-blue-900 dark:text-blue-200 block text-center">
                ورود سریع آزمایشی (بدون نیاز به رمز):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-colors flex flex-col items-center gap-1 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>مدیر کل</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('author')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition-colors flex flex-col items-center gap-1 shadow-sm"
                >
                  <PenTool className="w-4 h-4" />
                  <span>نویسنده</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('user')}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-800 text-white font-bold text-[11px] hover:bg-slate-700 transition-colors flex flex-col items-center gap-1 shadow-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>کاربر معمولی</span>
                </button>
              </div>
            </div>

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">نام کاربری یا ایمیل:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثلاً: admin یا ali@gmail.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">رمز عبور:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                {loading ? 'در حال ورود...' : 'ورود به پایگاه خبری'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
