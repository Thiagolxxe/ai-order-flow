
import React, { useEffect, useState } from 'react';
import { Control, FieldValues } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchEstados, fetchCidadesByEstado } from '@/services/restaurantService';
import { RestaurantFormValues } from '@/pages/RestaurantSignup';

// Define types for states and cities
type Estado = {
  uf: string;
  nome: string;
};

type Cidade = {
  id: number;
  nome: string;
};

interface AddressFormProps<
  TFieldValues extends FieldValues = RestaurantFormValues,
> {
  control: Control<TFieldValues>;
}

const AddressForm = <
  TFieldValues extends FieldValues = RestaurantFormValues,
>({
  control
}: AddressFormProps<TFieldValues>) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  
  // Fetch states on component mount
  useEffect(() => {
    const loadEstados = async () => {
      const data = await fetchEstados();
      setEstados(data);
    };
    
    loadEstados();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    const loadCidades = async () => {
      if (selectedEstado) {
        const data = await fetchCidadesByEstado(selectedEstado);
        setCidades(data);
      } else {
        setCidades([]);
      }
    };
    
    loadCidades();
  }, [selectedEstado]);

  // Handle state selection
  const handleEstadoChange = (value: string, onChange: (...event: any[]) => void) => {
    setSelectedEstado(value);
    onChange(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Endereço</h3>
      
      <FormField
        control={control}
        name={"endereco" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input placeholder="Rua, número, bairro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name={"estado" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select 
                onValueChange={(value) => handleEstadoChange(value, field.onChange)}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {estados.map(estado => (
                    <SelectItem key={estado.uf} value={estado.uf}>
                      {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={"cidade" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!selectedEstado}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedEstado ? "Selecione uma cidade" : "Selecione um estado primeiro"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cidades.map(cidade => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={"cep" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input placeholder="00000-000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AddressForm;
