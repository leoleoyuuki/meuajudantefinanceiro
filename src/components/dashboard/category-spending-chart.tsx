'use client';

import * as React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pie, PieChart, Cell } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

type CategorySpendingChartProps = {
  data: {
    category: string;
    amount: number;
    fill: string;
  }[];
};

const chartConfig = {
  amount: {
    label: 'Amount',
  },
} satisfies ChartConfig;

export function CategorySpendingChart({ data }: CategorySpendingChartProps) {
  const chartData = data.map((item) => ({ ...item, name: item.category }));

  const totalAmount = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.amount, 0);
  }, [data]);
  
  if (data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="flex h-60 items-center justify-center">
                <p className="text-muted-foreground">Nenhuma despesa registrada este mês.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => (
                    <div className="flex flex-col">
                      <span className="font-bold">{props.payload.name}</span>
                      <span>{formatCurrency(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
                <Cell key="add-slice-label" className="hidden" />
                {chartData.map((entry) => (
                    <Cell key={entry.category} fill={entry.fill} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"/>
                ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-mt-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
