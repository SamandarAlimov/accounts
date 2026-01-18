import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DateRange } from "react-day-picker";

interface DailyUsage {
  date: string;
  requests: number;
  successful: number;
  failed: number;
}

export function ApiUsageChart() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<DailyUsage[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 13),
    to: new Date(),
  });

  useEffect(() => {
    if (user && dateRange?.from && dateRange?.to) {
      fetchUsageData();
    }
  }, [user, dateRange]);

  const fetchUsageData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    try {
      const startDate = dateRange.from;
      const endDate = dateRange.to;

      const { data, error } = await supabase
        .from('api_usage_logs')
        .select('created_at, status_code')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Aggregate data by day
      const dailyMap = new Map<string, { requests: number; successful: number; failed: number }>();

      // Initialize all days in range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        dailyMap.set(dateKey, { requests: 0, successful: 0, failed: 0 });
      }

      // Populate with actual data
      (data || []).forEach(log => {
        const dateKey = log.created_at.split('T')[0];
        const existing = dailyMap.get(dateKey) || { requests: 0, successful: 0, failed: 0 };
        existing.requests += 1;
        if (log.status_code >= 200 && log.status_code < 400) {
          existing.successful += 1;
        } else {
          existing.failed += 1;
        }
        dailyMap.set(dateKey, existing);
      });

      // Convert to array
      const chartData: DailyUsage[] = Array.from(dailyMap.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      }));

      setUsageData(chartData);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalRequests = usageData.reduce((sum, d) => sum + d.requests, 0);
  const totalSuccessful = usageData.reduce((sum, d) => sum + d.successful, 0);
  const successRate = totalRequests > 0 ? Math.round((totalSuccessful / totalRequests) * 100) : 0;

  const getDateRangeLabel = () => {
    if (!dateRange?.from) return "Select date range";
    if (!dateRange.to) return format(dateRange.from, "MMM d, yyyy");
    return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              API Usage Trends
            </CardTitle>
            <CardDescription>Request volume for selected period</CardDescription>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getDateRangeLabel()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date > new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {!loading && (
              <div className="flex gap-6 text-sm">
                <div className="text-right">
                  <p className="text-muted-foreground">Total Requests</p>
                  <p className="text-xl font-bold">{totalRequests.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Success Rate</p>
                  <p className="text-xl font-bold text-green-500">{successRate}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : usageData.length === 0 || totalRequests === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-50" />
            <p>No API usage data available</p>
            <p className="text-sm">Start making API requests to see trends</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={usageData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === 'requests' ? 'Total Requests' : name === 'successful' ? 'Successful' : 'Failed'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="successful"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorRequests)"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stackId="1"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  fill="url(#colorFailed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {!loading && totalRequests > 0 && (
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Successful</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Failed</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}