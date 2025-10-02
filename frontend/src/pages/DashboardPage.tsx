import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCredit } from '@/contexts/CreditContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Layers, Package, CreditCard } from 'lucide-react';
import carouselService from '@/services/carousel.service';

function DashboardPage() {
  const { user } = useAuth();
  const { credits } = useCredit();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    recentProjects: 0,
    creditsUsed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Fetch projects to calculate stats
        const projects = await carouselService.getProjects();

        // Calculate stats from real data
        const totalProjects = projects.length;
        const recentProjects = projects.filter(p => {
          const createdAt = new Date(p.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdAt > weekAgo;
        }).length;

        const creditsUsed = projects.reduce((total, p) => total + p.creditsUsed, 0);

        setStats({
          totalProjects,
          recentProjects,
          creditsUsed,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Use fallback data if API fails
        setStats({
          totalProjects: 0,
          recentProjects: 0,
          creditsUsed: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Create Carousel',
      description: 'Design a single carousel with AI assistance',
      icon: Edit3,
      action: () => navigate('/editor'),
      color: 'bg-blue-500',
    },
    {
      title: 'Bulk Generator',
      description: 'Generate multiple carousels at once',
      icon: Layers,
      action: () => navigate('/bulk-generator'),
      color: 'bg-green-500',
    },
    {
      title: 'My Projects',
      description: 'View and manage your saved projects',
      icon: Package,
      action: () => navigate('/projects'),
      color: 'bg-purple-500',
    },
    {
      title: 'Credit Usage',
      description: 'View your credit usage history',
      icon: CreditCard,
      action: () => navigate('/credit-usage'),
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Let's create some amazing carousels today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Credits
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits}</div>
            <p className="text-xs text-muted-foreground">
              Credits available for use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalProjects}
            </div>
            <p className="text-xs text-muted-foreground">
              Carousels created all time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Credits Used
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.creditsUsed}
            </div>
            <p className="text-xs text-muted-foreground">
              Total credits consumed
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;