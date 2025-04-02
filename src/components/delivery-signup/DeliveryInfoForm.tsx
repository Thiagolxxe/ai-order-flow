
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeliveryFormValues } from '@/pages/delivery/DeliveryRegistration';

interface DeliveryInfoFormProps {
  control: Control<DeliveryFormValues>;
}

const DeliveryInfoForm = ({ control }: DeliveryInfoFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Dados do veículo</h3>
      
      <FormField
        control={control}
        name="tipo_veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de veículo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de veículo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="bicicleta">Bicicleta</SelectItem>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="placa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placa do veículo</FormLabel>
            <FormControl>
              <Input placeholder="AAA-0000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DeliveryInfoForm;
