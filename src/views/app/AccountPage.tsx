import React from 'react';
import { NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

type UsageSummary = {
  periodStart: string;
  periodEnd: string;
  maxSessionsPerMonth: number;
  usedSessionsThisMonth: number;
  remainingSessionsThisMonth: number;
  maxSessionDurationMinutes: number;
  maxConcurrentSessions: number;
  currentRunningSessions: number;
  maxConcurrentTasks: number;
  currentRunningTasks: number;
  maxAiTasksPerMonth: number;
  copilotEnabled: boolean;
};

type DailyUsage = { date: string; usage_seconds: number };

const mockUsageSummary: UsageSummary = {
  periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  maxSessionsPerMonth: 20,
  usedSessionsThisMonth: 8,
  remainingSessionsThisMonth: 12,
  maxSessionDurationMinutes: 60,
  maxConcurrentSessions: 3,
  currentRunningSessions: 1,
  maxConcurrentTasks: 3,
  currentRunningTasks: 0,
  maxAiTasksPerMonth: 100,
  copilotEnabled: true,
};

const mockDaily: DailyUsage[] = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return { date: d.toISOString().slice(0, 10), usage_seconds: Math.round(Math.random() * 900 + 60) };
});

const SideNav: React.FC = () => {
  const baseClass = 'block px-3 py-2 rounded-md text-sm';
  const active = 'bg-white/10 text-white';
  const inactive = 'text-gray-300 hover:text-white hover:bg-white/10';
  return (
    <nav className="space-y-1">
      <NavLink to="/app/account" end className={({ isActive }) => `${baseClass} ${isActive ? active : inactive}`}>Overview</NavLink>
      <NavLink to="/app/account/usage" className={({ isActive }) => `${baseClass} ${isActive ? active : inactive}`}>Usage</NavLink>
      <NavLink to="/app/account/subscription" className={({ isActive }) => `${baseClass} ${isActive ? active : inactive}`}>Subscription</NavLink>
      <NavLink to="/app/account/billing" className={({ isActive }) => `${baseClass} ${isActive ? active : inactive}`}>Billing</NavLink>
      <NavLink to="/app/account/invitations" className={({ isActive }) => `${baseClass} ${isActive ? active : inactive}`}>Invitations</NavLink>
    </nav>
  );
};

const Overview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Account Overview</h2>
        <p className="text-sm text-gray-400">Mocked data for demo; wire to `/users/me/usage/*` later.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-sm text-gray-400">Plan</div>
          <div className="text-xl font-semibold mt-1">Pro (Mock)</div>
          <div className="mt-2 text-xs text-gray-400">Copilot: <span className={mockUsageSummary.copilotEnabled ? 'text-green-400' : 'text-gray-400'}>{mockUsageSummary.copilotEnabled ? 'Enabled' : 'Disabled'}</span></div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-sm text-gray-400">Monthly Session Quota</div>
          <div className="text-xl font-semibold mt-1">{mockUsageSummary.maxSessionsPerMonth} sessions</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-sm text-gray-400">Used this cycle</div>
          <div className="text-xl font-semibold mt-1">{mockUsageSummary.usedSessionsThisMonth} sessions</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">Concurrent Sessions</div>
              <div className="text-xl font-semibold mt-1">{mockUsageSummary.currentRunningSessions} / {mockUsageSummary.maxConcurrentSessions}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Concurrent Tasks</div>
              <div className="text-xl font-semibold mt-1">{mockUsageSummary.currentRunningTasks} / {mockUsageSummary.maxConcurrentTasks}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">AI Tasks Monthly Quota</div>
              <div className="text-xl font-semibold mt-1">{mockUsageSummary.maxAiTasksPerMonth} tasks</div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Cycle</div>
            <div className="text-sm">{new Date(mockUsageSummary.periodStart).toLocaleDateString()} - {new Date(mockUsageSummary.periodEnd).toLocaleDateString()}</div>
          </div>
          <div className="text-sm text-gray-400">Remaining: <span className="text-white font-medium">{mockUsageSummary.remainingSessionsThisMonth} sessions</span></div>
        </div>
        <div className="mt-3 h-3 w-full bg-white/10 rounded">
          <div className="h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded" style={{ width: `${Math.min(100, Math.round(100 * mockUsageSummary.usedSessionsThisMonth / Math.max(1, mockUsageSummary.maxSessionsPerMonth)))}%` }} />
        </div>
      </div>
    </div>
  );
};

const Usage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Daily Usage (Mock)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-sm text-gray-400">Concurrent Overview</div>
          <div className="mt-2 text-sm">Sessions: {mockUsageSummary.currentRunningSessions} / {mockUsageSummary.maxConcurrentSessions}</div>
          <div className="mt-1 text-sm">Tasks: {mockUsageSummary.currentRunningTasks} / {mockUsageSummary.maxConcurrentTasks}</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-sm text-gray-400">Cycle</div>
          <div className="mt-2 text-sm">{new Date(mockUsageSummary.periodStart).toLocaleDateString()} - {new Date(mockUsageSummary.periodEnd).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="p-4 rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2">Usage (min)</th>
            </tr>
          </thead>
          <tbody>
            {mockDaily.map((d) => (
              <tr key={d.date} className="border-t border-white/10">
                <td className="py-2 pr-4">{d.date}</td>
                <td className="py-2">{Math.round(d.usage_seconds / 60)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Subscription: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Subscription (Mock)</h2>
      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="text-sm text-gray-400">Current Plan</div>
        <div className="mt-1 text-xl font-semibold">Pro Monthly</div>
        <div className="mt-2 text-sm text-gray-400">Renews on {new Date(mockUsageSummary.periodEnd).toLocaleDateString()}</div>
        <button className="mt-4 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 text-sm">Manage Plan</button>
      </div>
    </div>
  );
};

const Billing: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Billing (Mock)</h2>
      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="text-sm text-gray-400">Payment Method</div>
        <div className="mt-1 text-sm">Visa •••• 4242</div>
        <button className="mt-3 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 text-sm">Update Card</button>
      </div>
      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="text-sm text-gray-400">Invoices</div>
        <ul className="mt-2 text-sm space-y-2">
          <li className="flex justify-between border-t border-white/10 pt-2"><span>2025-08-01</span><span>$19.00</span></li>
          <li className="flex justify-between border-t border-white/10 pt-2"><span>2025-07-01</span><span>$19.00</span></li>
        </ul>
      </div>
    </div>
  );
};

import { createInvitation, listMyInvitations, InvitationRead, logout } from '../../lib/api';
import { clearToken } from '../../lib/auth';

const Invitations: React.FC = () => {
  const [items, setItems] = React.useState<InvitationRead[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [lastLink, setLastLink] = React.useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMyInvitations();
      setItems(res.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setLastLink(null);
    try {
      const res = await createInvitation();
      setLastLink(res.invitationUrl);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to create invitation');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Invitations</h2>
        <button onClick={handleCreate} disabled={creating} className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed">{creating ? 'Creating...' : 'Create Link'}</button>
      </div>
      {lastLink && (
        <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-200">
          New link: <span className="underline break-all">{lastLink}</span>
        </div>
      )}
      {loading && <div className="text-gray-400 text-sm">Loading...</div>}
      {error && !loading && <div className="text-red-400 text-sm">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-2 pr-4">Token</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Usage</th>
                <th className="py-2">Used by</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-white/10 align-top">
                  <td className="py-2 pr-4">
                    <div className="break-all text-gray-200">{it.token}</div>
                  </td>
                  <td className="py-2 pr-4">{it.created_at ? new Date(it.created_at).toLocaleString() : '—'}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-gray-200">
                      {it.used_count}/{it.max_uses} used · {it.remaining_uses} left
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="space-y-1">
                      {it.uses.length === 0 && <div className="text-gray-400">—</div>}
                      {it.uses.map((u, idx) => (
                        <div key={idx} className="text-gray-300">
                          <span className="text-xs text-gray-400">{new Date(u.used_at).toLocaleString()}</span>
                          {" · "}
                          <span className="font-mono">{u.used_by_user_id}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showSignoutModal, setShowSignoutModal] = React.useState(false);

  const confirmSignout = async () => {
    try {
      await logout();
    } catch {}
    clearToken();
    setShowSignoutModal(false);
    navigate('/app/login');
  };

  React.useEffect(() => {
    if (pathname === '/app/account' || pathname === '/app/account/') return;
  }, [pathname]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="p-4 rounded-xl border border-white/10 bg-black/20 sticky top-4">
            <div className="mb-3 text-xs uppercase tracking-wider text-gray-400">Account</div>
            <SideNav />
            <div className="mt-6">
              <button
                onClick={() => setShowSignoutModal(true)}
                className="w-full mt-2 px-3 py-2 rounded-md text-gray-200 text-sm bg-white/10 hover:bg-red-600 hover:text-white transition-colors border border-transparent hover:border-red-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="p-6 rounded-xl border border-white/10 bg-black/20">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="usage" element={<Usage />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="billing" element={<Billing />} />
              <Route path="invitations" element={<Invitations />} />
            </Routes>
            <Outlet />
          </div>
        </div>
        {showSignoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowSignoutModal(false)} />
            <div className="relative z-10 w-full max-w-sm rounded-xl border border-white/10 bg-gray-900 p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white">Sign out</h3>
              <p className="mt-2 text-sm text-gray-400">Are you sure you want to sign out?</p>
              <div className="mt-5 flex justify-end space-x-2">
                <button
                  onClick={() => setShowSignoutModal(false)}
                  className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignout}
                  className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;


