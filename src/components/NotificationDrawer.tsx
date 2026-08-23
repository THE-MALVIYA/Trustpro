import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  X,
  Bell,
  CheckCheck,
  Mail,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    currentUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useWallet();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter notifications specifically for current user or system OTP dispatch
  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id || (!n.userId && currentUser?.role === 'admin') || n.userId === 'sys_otp'
  );

  if (!isNotificationDrawerOpen) return null;

  const toggleExpand = (id: string) => {
    markNotificationAsRead(id);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsNotificationDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-[#0b0e14] border-l border-slate-800/80 shadow-2xl transition-all flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#3862FB]/10 border border-[#3862FB]/20 text-[#38B6FF]">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Gmail & Activity Dispatch</h2>
                  <p className="text-[11px] text-slate-400">Real-time email and transaction alerts</p>
                </div>
              </div>
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                id="close-notif-drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-800/50">
              <span className="text-[11px] text-slate-400">
                <span className="font-bold text-[#38B6FF]">
                  {userNotifications.filter((n) => !n.read).length}
                </span>{' '}
                Unread alerts
              </span>
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#38B6FF] hover:underline"
                id="mark-all-read-btn"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark All Read</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {userNotifications.length === 0 ? (
              <div className="text-center py-16">
                <Mail className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-400">No email or activity alerts yet</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Transfers, deposits, OTPs, and debits will appear here and in your inbox.
                </p>
              </div>
            ) : (
              userNotifications.map((notif) => {
                const isExpanded = expandedId === notif.id;
                return (
                  <div
                    key={notif.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      notif.read
                        ? 'bg-slate-950/50 border-slate-800/80'
                        : 'bg-slate-900/90 border-[#3862FB]/40 shadow-lg shadow-[#3862FB]/5'
                    }`}
                  >
                    <div
                      onClick={() => toggleExpand(notif.id)}
                      className="p-3.5 cursor-pointer flex items-start justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                            notif.type === 'deposit'
                              ? 'bg-[#3862FB]/10 text-[#38B6FF] border border-[#3862FB]/20'
                              : notif.type === 'withdraw'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : notif.type === 'security'
                              ? 'bg-blue-300/10 text-blue-300 border border-blue-300/20'
                              : 'bg-blue-300/10 text-blue-300 border border-blue-300/20'
                          }`}
                        >
                          {notif.type === 'deposit' ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : notif.type === 'withdraw' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : notif.type === 'security' ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white">{notif.title}</p>
                            {!notif.read && (
                              <span className="h-2 w-2 rounded-full bg-[#38B6FF] animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 leading-snug">{notif.message}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button className="text-slate-500 hover:text-slate-300 pt-1">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Email Details View (Expanded) */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#38B6FF] font-semibold pb-2 border-b border-slate-800/60">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span>Official Dispatched Gmail Notice</span>
                          </span>
                          <span className="bg-[#3862FB]/10 px-2 py-0.5 rounded-full border border-[#3862FB]/20">
                            Sent to {notif.recipientEmail}
                          </span>
                        </div>

                        {notif.emailSubject && (
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                              Subject:
                            </span>
                            <span className="text-slate-200 font-medium">{notif.emailSubject}</span>
                          </div>
                        )}

                        {notif.emailBody && (
                          <div className="mt-2 p-3 rounded-xl bg-[#08090c] border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-line leading-relaxed">
                            {notif.emailBody}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
