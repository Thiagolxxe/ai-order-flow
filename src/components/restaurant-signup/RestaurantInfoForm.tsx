
import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RestaurantFormValues } from '@/pages/RestaurantSignup';

interface RestaurantInfoFormProps<
  TFieldValues extends FieldValues = RestaurantFormValues,
> {
  control: Control<TFieldValues>;
}

const RestaurantInfoForm = <
  TFieldValues extends FieldValues = RestaurantFormValues,
>({ 
  control 
}: RestaurantInfoFormProps<TFieldValues>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informações do Restaurante</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="nome" as={FieldPath<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Restaurante</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Sabor Brasileiro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="tipo_cozinha" as={FieldPath<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Cozinha</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Italiana, Brasileira" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="descricao" as={FieldPath<TFieldValues>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva seu restaurante em poucas palavras"
                className="resize-none"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="telefone" as={FieldPath<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="faixa_preco" as={FieldPath<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faixa de Preço (1-5)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={5}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default RestaurantInfoForm;
