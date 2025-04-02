
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DeliveryFormValues } from '@/pages/delivery/DeliveryRegistration';

interface AddressFormProps {
  control: Control<DeliveryFormValues>;
}

const AddressForm = ({ control }: AddressFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Seu endereço</h3>
      
      <FormField
        control={control}
        name="endereco"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço completo</FormLabel>
            <FormControl>
              <Input placeholder="Rua, número, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input placeholder="Sua cidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado (UF)</FormLabel>
              <FormControl>
                <Input placeholder="SP" maxLength={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <Input placeholder="XXXXX-XXX" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AddressForm;
