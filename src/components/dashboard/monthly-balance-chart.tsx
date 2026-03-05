'use client';
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import type { MonthlySummary } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

type MonthlyBalanceChartProps = {
  data: MonthlySummary[];
};

const chartConfig = {
  totalIncome: {
    label: 'Receitas',
    color: 'hsl(var(--primary))',
  },
  totalExpense: {
    label: 'Despesas',
    color: 'hsl(var(--foreground))',
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const incomeData = payload.find((p: any) => p.dataKey === 'totalIncome');
    const expenseData = payload.find((p: any) => p.dataKey === 'totalExpense');

    return (
      <div className="min-w-[10rem] rounded-lg border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-2 text-center font-bold capitalize text-foreground">
          {label}
        </p>
        <div className="space-y-1.5">
          {incomeData && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: incomeData.color }}
                />
                <p className="text-sm text-muted-foreground">Receitas</p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(incomeData.value)}
              </p>
            </div>
          )}
          {expenseData && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: expenseData.color }}
                />
                <p className="text-sm text-muted-foreground">Despesas</p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(expenseData.value)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export function MonthlyBalanceChart({ data }: MonthlyBalanceChartProps) {
  const chartData = data
    .map((summary) => ({
      month: format(new Date(summary.year, summary.month - 1), 'MMM', {
        locale: ptBR,
      }),
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
    }))
    .reverse();

  const latestSummary = data.length > 0 ? data[0] : null;

  const renderAlert = () => {
    if (!latestSummary || format(new Date(), 'yyyy-MM') !== latestSummary.id) {
      return (
        <CardDescription className="flex items-center gap-2">
          <TrendingUp className="size-4" />
          Suas receitas e despesas dos últimos meses.
        </CardDescription>
      );
    }
    
    const { totalIncome, totalExpense } = latestSummary;
    const difference = totalIncome - totalExpense;

    if (difference >= 1500) {
      return (
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="size-4" />
          <p>
            Parabéns! Você economizou{' '}
            <span className="font-bold">{formatCurrency(difference)}</span> este
            mês.
          </p>
        </div>
      );
    }

    if (totalExpense > totalIncome) {
      return (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          <p>
            Atenção! Suas despesas superaram as receitas em{' '}
            <span className="font-bold">
              {formatCurrency(Math.abs(difference))}
            </span>
            .
          </p>
        </div>
      );
    }

    return (
      <CardDescription className="flex items-center gap-2">
        <TrendingUp className="size-4" />
        Seu balanço este mês está positivo em {formatCurrency(difference)}.
      </CardDescription>
    );
  };


  const latestData = chartData[chartData.length - 1];

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balanço Mensal</CardTitle>
          <CardDescription>
            Acompanhe suas receitas e despesas ao longo do tempo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-60 items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum dado disponível para exibir o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Balanço Mensal</CardTitle>
            {renderAlert()}
          </div>
          <div className="flex gap-4 text-sm sm:items-center">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              />
              <span className="text-muted-foreground">Receitas</span>
              {latestData && (
                <span className="font-semibold">
                  {formatCurrency(latestData.totalIncome)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--foreground))' }}
              />
              <span className="text-muted-foreground">Despesas</span>
              {latestData && (
                <span className="font-semibold">
                  {formatCurrency(latestData.totalExpense)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <ResponsiveContainer>
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-totalIncome)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-totalIncome)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--muted))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--muted))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={(value) => value.slice(0, 3)}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Area
                dataKey="totalExpense"
                type="monotone"
                fill="url(#fillExpense)"
                stroke="var(--color-totalExpense)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                }}
                name="Despesas"
              />
              <Area
                dataKey="totalIncome"
                type="monotone"
                fill="url(#fillIncome)"
                stroke="var(--color-totalIncome)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                }}
                name="Receitas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
