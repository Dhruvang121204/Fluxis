import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppShell from "@/components/layout/app-shell";
import { Transaction } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

export default function ReportsPage() {
  const [timePeriod, setTimePeriod] = useState("30days");
  const [reportType, setReportType] = useState("expense");
  
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  if (!transactions) {
    return (
      <AppShell
        title="Reports"
        subtitle="Visualize your financial data"
        activePage="reports"
      >
        <div className="p-4 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading reports...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Filter transactions based on time period
  const getDateRange = () => {
    const now = new Date();
    
    switch (timePeriod) {
      case "7days":
        return { start: subMonths(now, 0.25), end: now };
      case "30days":
        return { start: subMonths(now, 1), end: now };
      case "3months":
        return { start: subMonths(now, 3), end: now };
      case "6months":
        return { start: subMonths(now, 6), end: now };
      case "1year":
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subMonths(now, 1), end: now };
    }
  };

  const { start, end } = getDateRange();
  
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate >= start && 
      transactionDate <= end && 
      transaction.type === reportType
    );
  });

  // Prepare category breakdown data
  const categoryData = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    const amount = Number(transaction.amount);
    
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    
    acc[category].value += amount;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  const pieChartData = Object.values(categoryData).sort((a, b) => b.value - a.value);

  // Prepare time series data for line/bar chart
  const getDailyData = () => {
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayTransactions = filteredTransactions.filter(t => 
        isSameDay(new Date(t.date), day)
      );
      
      const total = dayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        date: format(day, "MMM d"),
        amount: total
      };
    });
  };

  const timeSeriesData = getDailyData();

  // Prepare monthly comparison data
  const getMonthlyData = () => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return (
          tDate >= monthStart && 
          tDate <= monthEnd && 
          t.type === reportType
        );
      });
      
      const total = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        month: format(date, "MMM"),
        amount: total
      };
    }).reverse();
    
    return months;
  };

  const monthlyData = getMonthlyData();

  // Colors for charts
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#D946EF'];

  return (
    <AppShell
      title="Reports"
      subtitle="Visualize your financial data"
      activePage="reports"
    >
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Analyze your spending and income</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="category" className="space-y-4">
              <TabsList>
                <TabsTrigger value="category">Category Breakdown</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="monthly">Monthly Comparison</TabsTrigger>
              </TabsList>
              
              <TabsContent value="category" className="space-y-4">
                {pieChartData.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No data available for this time period</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Amount']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-700">Category Details</h3>
                      <div className="space-y-2">
                        {pieChartData.map((category, index) => (
                          <div key={category.name} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="text-sm">{category.name}</span>
                            </div>
                            <span className="text-sm font-mono">₹{category.value.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="timeline">
                {timeSeriesData.length === 0 || timeSeriesData.every(d => d.amount === 0) ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No data available for this time period</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Amount']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#2563EB" 
                          strokeWidth={2} 
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="monthly">
                {monthlyData.length === 0 || monthlyData.every(d => d.amount === 0) ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No data available for monthly comparison</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Amount']}
                        />
                        <Legend />
                        <Bar 
                          dataKey="amount" 
                          fill="#2563EB" 
                          name={reportType === "expense" ? "Expenses" : "Income"}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Overview of your financial status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Total {reportType === "expense" ? "Expenses" : "Income"}</p>
                <p className="text-2xl font-semibold text-blue-900">
                  ₹{filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(0)}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Average per Day</p>
                <p className="text-2xl font-semibold text-green-900">
                  ₹{(filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / 
                     Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))).toFixed(0)}
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Number of Transactions</p>
                <p className="text-2xl font-semibold text-purple-900">
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
