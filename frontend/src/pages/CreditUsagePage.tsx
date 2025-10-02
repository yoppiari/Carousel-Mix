import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCredit } from '@/contexts/CreditContext';
import { CreditCard, TrendingDown, Package } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  status: 'completed' | 'refunded';
}

function CreditUsagePage() {
  const { credits } = useCredit();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalUsed: 0,
    thisMonth: 0,
    lastMonth: 0,
  });

  useEffect(() => {
    // TODO: Fetch actual transactions from backend
    setTransactions([
      {
        id: '1',
        type: 'Single Carousel',
        amount: 2,
        description: 'Generated carousel for Summer Sale',
        createdAt: '2024-01-15T10:30:00',
        status: 'completed',
      },
      {
        id: '2',
        type: 'Bulk Generation',
        amount: 5,
        description: 'Generated 5 carousel sets',
        createdAt: '2024-01-14T14:20:00',
        status: 'completed',
      },
      {
        id: '3',
        type: 'AI Generation',
        amount: 1,
        description: 'AI content generation',
        createdAt: '2024-01-13T09:15:00',
        status: 'completed',
      },
      {
        id: '4',
        type: 'Single Carousel',
        amount: 2,
        description: 'Generated carousel - Failed',
        createdAt: '2024-01-12T16:45:00',
        status: 'refunded',
      },
    ]);

    setStats({
      totalUsed: 45,
      thisMonth: 12,
      lastMonth: 18,
    });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Credit Usage</h1>
        <p className="text-gray-600 mt-2">Track your credit consumption history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits}</div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Used</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsed}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Credits used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastMonth}</div>
            <p className="text-xs text-muted-foreground">Credits used</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No transactions yet
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium">{transaction.type}</div>
                    <div className="text-sm text-gray-500">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        transaction.status === 'refunded'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.status === 'refunded' ? '+' : '-'}
                      {transaction.amount} credits
                    </div>
                    {transaction.status === 'refunded' && (
                      <div className="text-xs text-green-600">Refunded</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreditUsagePage;