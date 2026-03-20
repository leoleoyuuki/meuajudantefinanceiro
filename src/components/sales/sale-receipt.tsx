'use client';

import React, { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Download, Copy, PiggyBank } from 'lucide-react';
import type { Product } from '@/lib/types';

type CartItem = {
  product: Product;
  quantity: number;
};

type SaleReceiptProps = {
  items: CartItem[];
  total: number;
  date: Date;
};

const SaleReceipt: React.FC<SaleReceiptProps> = ({ items, total, date }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = useCallback(async () => {
    if (receiptRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `comprovante-venda-${format(date, 'yyyy-MM-dd')}.png`;
      link.href = dataUrl;
      link.click();
      toast({
        title: 'Download iniciado',
        description: 'O comprovante está sendo baixado.',
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Erro ao baixar',
        description: 'Não foi possível gerar a imagem do comprovante.',
      });
    }
  }, [receiptRef, date, toast]);

  const handleCopy = useCallback(async () => {
    if (receiptRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(receiptRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      toast({
        title: 'Comprovante copiado!',
        description: 'A imagem foi copiada para a área de transferência.',
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar a imagem do comprovante.',
      });
    }
  }, [receiptRef, toast]);


  const calculateItemTotal = (item: CartItem) => {
    if (item.product.pricingModel === 'unit') {
      return item.product.salePrice * item.quantity;
    } else {
      // weight_100g
      return (item.product.salePrice / 100) * item.quantity;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div ref={receiptRef} className="bg-white text-black p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center mb-6 text-center">
            <PiggyBank className="w-12 h-12 text-primary mb-2" />
            <h2 className="text-xl font-bold font-headline">Meu Ajudante Financeiro</h2>
            <p className="text-sm text-gray-600">Comprovante de Venda</p>
        </div>
        
        <div className="text-xs text-gray-500 mb-4 flex justify-between">
            <span>{format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            <span>{format(date, "HH:mm")}</span>
        </div>

        <div className="space-y-3 border-t border-b border-dashed border-gray-300 py-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-xs text-gray-600">
                  {item.product.pricingModel === 'unit'
                    ? `${item.quantity} x ${formatCurrency(item.product.salePrice)}`
                    : `${item.quantity}g @ ${formatCurrency(item.product.salePrice)}/100g`}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(calculateItemTotal(item))}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center font-bold text-lg pt-4">
          <span>TOTAL</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Obrigado pela sua compra!</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2" />
          Baixar
        </Button>
        <Button variant="outline" onClick={handleCopy}>
          <Copy className="mr-2" />
          Copiar
        </Button>
      </div>
    </div>
  );
};

export default SaleReceipt;
