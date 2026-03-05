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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import type { MonthlySummary } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

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
    color: 'hsl(var(--destructive))',
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
        <CardTitle>Balanço Mensal</CardTitle>
        <CardDescription>
          Acompanhe suas receitas e despesas ao longo do tempo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="totalIncome"
                stroke={chartConfig.totalIncome.color}
                strokeWidth={2}
                dot={false}
                name="Receitas"
              />
              <Line
                type="monotone"
                dataKey="totalExpense"
                stroke={chartConfig.totalExpense.color}
                strokeWidth={2}
                dot={false}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
