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
  AreaChart,
  Area,
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
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-totalIncome)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-totalIncome)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-totalExpense)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-totalExpense)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) =>
                  `R$${new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)}`
                }
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
                fontSize={12}
              />
              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
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
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="totalIncome"
                type="monotone"
                fill="url(#colorIncome)"
                stroke="transparent"
              />
              <Area
                dataKey="totalExpense"
                type="monotone"
                fill="url(#colorExpense)"
                stroke="transparent"
              />
              <Line
                type="monotone"
                dataKey="totalIncome"
                stroke="var(--color-totalIncome)"
                strokeWidth={2}
                dot={false}
                name="Receitas"
              />
              <Line
                type="monotone"
                dataKey="totalExpense"
                stroke="var(--color-totalExpense)"
                strokeWidth={2}
                dot={false}
                name="Despesas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
