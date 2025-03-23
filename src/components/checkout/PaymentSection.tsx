
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, BanknoteIcon, QrCode as QrCodeIcon } from 'lucide-react';
import { PaymentMethod } from './types';

interface PaymentSectionProps {
  selectedPayment: PaymentMethod;
  setSelectedPayment: (method: PaymentMethod) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  selectedPayment,
  setSelectedPayment
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-medium mb-4 text-lg">Forma de Pagamento</h2>
        
        <Tabs 
          defaultValue="credit" 
          value={selectedPayment}
          onValueChange={(value) => setSelectedPayment(value as PaymentMethod)}
        >
          <TabsList className="w-full mb-4">
            <TabsTrigger value="credit" className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão
            </TabsTrigger>
            <TabsTrigger value="money" className="flex-1">
              <BanknoteIcon className="h-4 w-4 mr-2" />
              Dinheiro
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex-1">
              <QrCodeIcon className="h-4 w-4 mr-2" />
              Pix
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="credit" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="card-number">Número do Cartão</Label>
                <Input id="card-number" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="card-name">Nome no Cartão</Label>
                <Input id="card-name" placeholder="Seu nome como está no cartão" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="card-expiry">Validade</Label>
                <Input id="card-expiry" placeholder="MM/AA" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="card-cvv">CVV</Label>
                <Input id="card-cvv" placeholder="123" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="money" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="change">Troco para</Label>
              <Input id="change" placeholder="Opcional: Valor para troco" />
              <p className="text-sm text-foreground/70">Deixe em branco se não precisar de troco</p>
            </div>
          </TabsContent>
          
          <TabsContent value="pix" className="text-center py-4">
            <div className="bg-muted p-6 rounded-lg inline-block mb-3">
              <QrCodeIcon className="h-32 w-32 mx-auto" />
            </div>
            <p className="text-foreground/70 text-sm">
              O QR Code será gerado após a confirmação do pedido
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
