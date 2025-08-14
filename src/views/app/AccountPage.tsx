import React from 'react';
import { NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

type UsageSummary = {
  periodStart: string;
  periodEnd: string;
  maxAudioMinutesPerMonth: number;
  usedAudioMinutes: number;
  remainingAudioMinutes: number;
};

type DailyUsage = { date: string; usage_seconds: number };

const mockUsageSummary: UsageSummary = {
  periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  maxAudioMinutesPerMonth: 300,
  usedAudioMinutes: 124,
  remainingAudioMinutes: 176,
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
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-sm text-gray-400">Monthly Quota</div>
          <div className="text-xl font-semibold mt-1">{mockUsageSummary.maxAudioMinutesPerMonth} mins</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-sm text-gray-400">Used this cycle</div>
          <div className="text-xl font-semibold mt-1">{mockUsageSummary.usedAudioMinutes} mins</div>
        </div>
      </div>
      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Cycle</div>
            <div className="text-sm">{new Date(mockUsageSummary.periodStart).toLocaleDateString()} - {new Date(mockUsageSummary.periodEnd).toLocaleDateString()}</div>
          </div>
          <div className="text-sm text-gray-400">Remaining: <span className="text-white font-medium">{mockUsageSummary.remainingAudioMinutes} mins</span></div>
        </div>
        <div className="mt-3 h-3 w-full bg-white/10 rounded">
          <div className="h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded" style={{ width: `${Math.min(100, Math.round(100 * mockUsageSummary.usedAudioMinutes / Math.max(1, mockUsageSummary.maxAudioMinutesPerMonth)))}%` }} />
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
          <div className="text-sm text-gray-400">Summary</div>
          <div className="mt-2 text-sm">Used: {mockUsageSummary.usedAudioMinutes} mins / {mockUsageSummary.maxAudioMinutesPerMonth} mins</div>
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

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="p-6 rounded-xl border border-white/10 bg-black/20">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="usage" element={<Usage />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="billing" element={<Billing />} />
            </Routes>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;


