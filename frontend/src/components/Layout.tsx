import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCredit } from '@/contexts/CreditContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Edit3,
  Package,
  CreditCard,
  LogOut,
  Layers,
} from 'lucide-react';

function Layout() {
  const { user, logout } = useAuth();
  const { credits } = useCredit();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Editor', href: '/editor', icon: Edit3 },
    { name: 'Bulk Generator', href: '/bulk-generator', icon: Layers },
    { name: 'Projects', href: '/projects', icon: Package },
    { name: 'Credit Usage', href: '/credit-usage', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <nav className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Carousel Pro</h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-4">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`
                        }
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Credits</span>
                <span className="text-lg font-semibold text-gray-900">
                  {credits}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {user?.email}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;