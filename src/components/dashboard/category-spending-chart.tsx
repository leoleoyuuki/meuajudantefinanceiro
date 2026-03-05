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
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Label, Pie, PieChart, Sector, Cell } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';

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

  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined
  );

  const totalAmount = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.amount, 0);
  }, [data]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = (data || []).reduce((acc, item) => {
      acc[item.category] = {
        label: item.category,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);
    return config;
  }, [data]);

  const currentMonthName = React.useMemo(() => {
    return format(new Date(), 'MMMM', { locale: ptBR });
  }, []);

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
  
  const activeData = activeIndex !== undefined ? chartData[activeIndex] : null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle>Gastos por Categoria</CardTitle>
        <CardDescription>{`Despesas de ${currentMonthName}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[250px]"
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
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <Sector {...props} outerRadius={outerRadius + 8} />
                )}
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
                      const labelText = activeData
                        ? activeData.name
                        : 'Despesas';
                      const labelValue = activeData
                        ? activeData.amount
                        : totalAmount;

                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold"
                          >
                            {formatCurrency(labelValue)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 16}
                            className="fill-muted-foreground text-xs"
                          >
                            {labelText}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex flex-col justify-center gap-2 border-t px-4 pt-4 text-sm md:border-l md:border-t-0 md:py-0 md:pr-4">
            {chartData
              .sort((a, b) => b.amount - a.amount)
              .map((item, index) => (
              <div
                key={item.category}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors',
                  activeIndex === index ? 'bg-muted' : 'hover:bg-muted/50'
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="flex-1 truncate font-medium">
                    {item.category}
                  </span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
