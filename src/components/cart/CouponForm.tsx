
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PercentIcon } from 'lucide-react';
import { toast } from 'sonner';
import { connectToDatabase } from '@/integrations/mongodb/client';

interface CouponFormProps {
  restaurantId: string | undefined;
  subtotal: number;
  currentDiscount: number;
  onApplyCoupon: (discount: number) => void;
}

const CouponForm: React.FC<CouponFormProps> = ({ 
  restaurantId, 
  subtotal, 
  currentDiscount, 
  onApplyCoupon 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode) return;
    
    setIsLoading(true);
    try {
      // Connect to database
      const { db } = await connectToDatabase();
      
      // Verify coupon is valid
      const now = new Date().toISOString();
      const promoResult = await db.collection('coupons').findOne({
        codigo: couponCode.toUpperCase(),
        ativo: true,
        data_inicio: { $lte: now },
        data_fim: { $gte: now }
      });
      
      if (!promoResult.data) {
        toast.error('Cupom inválido ou expirado');
        return;
      }
      
      const promoData = promoResult.data;
      
      // Check if coupon is for the current restaurant
      if (promoData.restaurante_id && promoData.restaurante_id !== restaurantId) {
        toast.error('Este cupom não é válido para este restaurante');
        return;
      }
      
      // Check if minimum order value is sufficient
      if (promoData.valor_pedido_minimo > 0 && promoData.valor_pedido_minimo > subtotal) {
        toast.error(`Valor mínimo para este cupom: R$${promoData.valor_pedido_minimo.toFixed(2).replace('.', ',')}`);
        return;
      }
      
      // Apply discount
      if (promoData.tipo === 'percentual') {
        onApplyCoupon(promoData.valor);
        toast.success(`Cupom aplicado: ${promoData.valor}% de desconto`);
      } else {
        // For fixed value discounts, calculate percentage equivalent to simplify
        const percentDiscount = (promoData.valor / subtotal) * 100;
        onApplyCoupon(percentDiscount);
        toast.success(`Cupom aplicado: R$${promoData.valor.toFixed(2).replace('.', ',')} de desconto`);
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      toast.error('Não foi possível aplicar o cupom');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mb-6">
      <Input
        placeholder="Cupom de desconto"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
      />
      <Button 
        variant="outline" 
        onClick={applyCoupon}
        disabled={!couponCode || isLoading}
      >
        {isLoading ? (
          "Aplicando..."
        ) : (
          <>
            <PercentIcon className="h-4 w-4 mr-2" />
            Aplicar
          </>
        )}
      </Button>
    </div>
  );
};

export default CouponForm;
