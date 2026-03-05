'use client';

import * as React from 'react';
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
  type ChartConfig,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Label, Pie, PieChart, Cell } from 'recharts';

type CategorySpendingChartProps = {
  data: {
    category: string;
    amount: number;
    fill: string;
  }[];
};

export function CategorySpendingChart({ data }: CategorySpendingChartProps) {
  const chartData = React.useMemo(
    () => data.map((item) => ({ ...item, name: item.category })),
    [data]
  );

  const totalAmount = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.amount, 0);
  }, [data]);

  const chartConfig = React.useMemo(() => {
    return (data || []).reduce((acc, item) => {
      acc[item.category] = {
        label: item.category,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);
  }, [data]);

  const currentMonthName = React.useMemo(() => {
    return format(new Date(), 'MMMM', { locale: ptBR });
  }, []);

  const sortedChartData = React.useMemo(
    () => [...chartData].sort((a, b) => b.amount - a.amount),
    [chartData]
  );

  if (data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Gastos por Categoria</CardTitle>
          <CardDescription>
            {`Nenhuma despesa registrada em ${currentMonthName}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center pb-0">
          <p className="text-sm text-muted-foreground">
            Sem dados para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start pb-4">
        <CardTitle>Gastos por Categoria</CardTitle>
        <CardDescription>{`Despesas de ${currentMonthName}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="grid h-full grid-cols-1 items-center gap-8 md:grid-cols-2">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-full w-full max-w-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.fill}
                    className="focus:outline-none"
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy - 10}
                            className="fill-muted-foreground text-xs"
                          >
                            Despesa Total
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 12}
                            className="fill-foreground text-xl font-bold"
                          >
                            {formatCurrency(totalAmount)}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex flex-col justify-center gap-4">
            {sortedChartData.map((item) => {
              const percentage =
                totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
              return (
                <div key={item.category} className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-lg font-bold leading-none text-foreground">
                    {percentage.toFixed(0)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
