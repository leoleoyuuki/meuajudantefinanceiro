'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Label, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Inbox } from 'lucide-react';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';

type CategorySpendingChartProps = {
  data: {
    category: string;
    amount: number;
    fill: string;
  }[];
};

export function CategorySpendingChart({ data }: CategorySpendingChartProps) {
  // Cálculos memorizados
  const totalAmount = React.useMemo(() => 
    data.reduce((acc, curr) => acc + curr.amount, 0), 
  [data]);

  const currentMonthName = React.useMemo(() => 
    format(new Date(), 'MMMM', { locale: ptBR }), 
  []);

  const chartConfig = React.useMemo(() => {
    return data.reduce((acc, item) => {
      acc[item.category] = { label: item.category, color: item.fill };
      return acc;
    }, {} as ChartConfig);
  }, [data]);

  // Estado Vazio (Empty State)
  if (data.length === 0) {
    return (
      <Card className="flex flex-col min-h-[400px] items-center justify-center text-center border-dashed">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Sem gastos</CardTitle>
          <CardDescription>
            Nenhuma despesa registrada em {currentMonthName}.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-sm overflow-hidden">
      <CardHeader className="items-start pb-2">
        <CardTitle className="text-xl font-bold tracking-tight">Gastos por Categoria</CardTitle>
        <CardDescription className="capitalize">
          Resumo de {currentMonthName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-6 pt-2">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          
          {/* Seção do Gráfico com tamanho fixo */}
          <div className="flex-shrink-0">
            <ChartContainer
              config={chartConfig}
              className="aspect-square h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius="68%"
                    outerRadius="90%"
                    paddingAngle={3}
                    strokeWidth={2}
                    animationDuration={1000}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fill} 
                        className="stroke-background transition-all duration-300 hover:opacity-80 outline-none"
                      />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy - 8} className="fill-muted-foreground text-[10px] uppercase font-medium tracking-widest">
                                Total
                              </tspan>
                              <tspan x={viewBox.cx} y={viewBox.cy + 16} className="fill-foreground text-xl font-bold">
                                {formatCurrency(totalAmount).replace('R$', '').trim()}
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Seção da Legenda/Lista que encolhe */}
          <div className="w-full flex-1 md:min-w-0">
            <ScrollArea className="h-[250px] w-full pr-4">
              <div className="grid grid-cols-1 gap-4">
                {[...data]
                  .sort((a, b) => b.amount - a.amount)
                  .map((item) => {
                    const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
                    return (
                      <div 
                        key={item.category} 
                        className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-3 w-3 rounded-full shadow-sm shrink-0" 
                            style={{ backgroundColor: item.fill }} 
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold leading-tight">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold tabular-nums text-foreground">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
