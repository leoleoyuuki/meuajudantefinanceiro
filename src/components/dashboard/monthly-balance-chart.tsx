'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import type { MonthlySummary } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';

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
            <CardDescription>
              Suas receitas e despesas dos últimos meses.
            </CardDescription>
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
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => {
                      if (name === 'totalIncome')
                        return [formatCurrency(Number(value)), 'Receitas'];
                      if (name === 'totalExpense')
                        return [formatCurrency(Number(value)), 'Despesas'];
                      return [value];
                    }}
                  />
                }
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
                fill="transparent"
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
