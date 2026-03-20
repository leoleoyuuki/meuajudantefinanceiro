'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { iconMap } from '@/lib/icons';
import type { Transaction, Product } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import SaleReceipt from '@/components/sales/sale-receipt';

type RecentTransactionsProps = {
  transactions: Transaction[];
  isBalanceVisible: boolean;
};

// This type is used inside SaleReceipt
type CartItem = {
    product: Product;
    quantity: number;
};

export function RecentTransactions({
  transactions,
  isBalanceVisible,
}: RecentTransactionsProps) {
    const [selectedSale, setSelectedSale] = useState<Transaction | null>(null);

    const handleTransactionClick = (transaction: Transaction) => {
        if (transaction.items && transaction.items.length > 0) {
        setSelectedSale(transaction);
        }
    };

    const handleDialogClose = () => {
        setSelectedSale(null);
    };

    const receiptItems: CartItem[] | null = selectedSale?.items ? selectedSale.items.map(item => ({
        quantity: item.quantity,
        product: {
            id: item.productId,
            name: item.name,
            pricingModel: item.pricingModel,
            salePrice: item.salePrice,
            // The following are not used by SaleReceipt but are part of Product type
            userId: selectedSale.userId,
            costPrice: 0, // Not available in transaction log, not needed for receipt
        }
    })) : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Button asChild variant="link">
              <Link href="/transactions">Ver todas</Link>
            </Button>
          </div>
          <CardDescription>
            Suas últimas 5 movimentações financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {transactions.map((transaction) => {
                const Icon =
                  transaction.category && iconMap[transaction.category.icon];
                const color = transaction.category?.color || '#888';
                const isSale = transaction.items && transaction.items.length > 0;
                
                return (
                  <div 
                    key={transaction.id} 
                    className={cn(
                        "flex items-center gap-4 rounded-lg -m-2 p-2",
                        isSale && "cursor-pointer transition-colors hover:bg-muted/50"
                    )}
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <div
                      className="flex size-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${color}20`,
                      }}
                    >
                      {Icon && <Icon className="size-5" style={{ color }} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'font-bold',
                        transaction.type === 'income'
                          ? 'text-primary'
                          : 'text-destructive'
                      )}
                    >
                      {isBalanceVisible ? (
                        <>
                          {transaction.type === 'expense' && '- '}
                          {formatCurrency(transaction.amount)}
                        </>
                      ) : (
                        'R$ ●●●●●'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma transação registrada ainda.
            </p>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedSale} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
          <DialogContent className="max-w-sm">
              <DialogHeader>
                  <DialogTitle>Comprovante de Venda</DialogTitle>
                  <DialogDescription>
                      Detalhes da venda registrada.
                  </DialogDescription>
              </DialogHeader>
              {selectedSale && receiptItems && (
                  <SaleReceipt 
                      items={receiptItems} 
                      total={selectedSale.amount}
                      date={new Date(selectedSale.date)}
                  />
              )}
              <DialogFooter>
                  <Button variant="outline" onClick={handleDialogClose}>
                      Fechar
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
