
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
import { Loader2 } from 'lucide-react';

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
  const [isLoadingCidades, setIsLoadingCidades] = useState<boolean>(false);
  
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
        setIsLoadingCidades(true);
        try {
          console.log(`Carregando cidades para: ${selectedEstado}`);
          const data = await fetchCidadesByEstado(selectedEstado);
          console.log(`Cidades carregadas: ${data.length}`);
          setCidades(data);
        } catch (error) {
          console.error("Erro ao carregar cidades:", error);
        } finally {
          setIsLoadingCidades(false);
        }
      } else {
        setCidades([]);
      }
    };
    
    loadCidades();
  }, [selectedEstado]);

  // Handle state selection
  const handleEstadoChange = (value: string, onChange: (...event: any[]) => void) => {
    console.log(`Estado selecionado: ${value}`);
    setSelectedEstado(value);
    onChange(value);
    // Limpar a cidade selecionada quando mudar o estado
    const cityField = control._fields?.cidade;
    if (cityField) {
      control._formValues.cidade = "";
    }
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
                disabled={!selectedEstado || isLoadingCidades}
              >
                <FormControl>
                  <SelectTrigger>
                    {isLoadingCidades ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      <SelectValue 
                        placeholder={
                          selectedEstado 
                            ? cidades.length > 0 
                              ? "Selecione uma cidade" 
                              : "Nenhuma cidade encontrada" 
                            : "Selecione um estado primeiro"
                        } 
                      />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {cidades.length === 0 && !isLoadingCidades && selectedEstado && (
                    <div className="p-2 text-center text-muted-foreground">
                      Nenhuma cidade encontrada
                    </div>
                  )}
                  {cidades.map(cidade => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cidades.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {cidades.length} cidades disponíveis
                </div>
              )}
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
