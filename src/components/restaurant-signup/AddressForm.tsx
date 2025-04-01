
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
import { RestaurantFormValues } from '@/pages/RestaurantSignup';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define types for states and cities
type Estado = {
  id: number;
  sigla: string;
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
  const [isLoadingEstados, setIsLoadingEstados] = useState<boolean>(true);
  const [isLoadingCidades, setIsLoadingCidades] = useState<boolean>(false);
  const [errorEstados, setErrorEstados] = useState<string | null>(null);
  const [errorCidades, setErrorCidades] = useState<string | null>(null);
  
  // Fetch states directly from IBGE API
  useEffect(() => {
    const fetchEstados = async () => {
      setIsLoadingEstados(true);
      setErrorEstados(null);
      
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar estados: ${response.status}`);
        }
        
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
        setErrorEstados("Não foi possível carregar a lista de estados. Tente novamente mais tarde.");
      } finally {
        setIsLoadingEstados(false);
      }
    };
    
    fetchEstados();
  }, []);

  // Fetch cities when state changes - direct from IBGE API
  useEffect(() => {
    const fetchCidades = async () => {
      if (selectedEstado) {
        setIsLoadingCidades(true);
        setCidades([]);
        setErrorCidades(null);
        
        try {
          console.log(`Carregando cidades para: ${selectedEstado}`);
          
          const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios?orderBy=nome`);
          
          if (!response.ok) {
            throw new Error(`Erro ao carregar cidades: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(`Cidades carregadas: ${data.length}`);
          setCidades(data);
        } catch (error) {
          console.error("Erro ao buscar cidades:", error);
          setErrorCidades("Não foi possível carregar a lista de cidades. Tente novamente mais tarde.");
        } finally {
          setIsLoadingCidades(false);
        }
      } else {
        setCidades([]);
      }
    };
    
    fetchCidades();
  }, [selectedEstado]);

  // Handle state selection
  const handleEstadoChange = (value: string, onChange: (...event: any[]) => void) => {
    console.log(`Estado selecionado: ${value}`);
    setSelectedEstado(value);
    onChange(value);
    
    // Clear the selected city when changing state
    const cityField = control._fields?.cidade;
    if (cityField) {
      control._formValues.cidade = "";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Endereço</h3>

      {(errorEstados || errorCidades) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {errorEstados || errorCidades}
          </AlertDescription>
        </Alert>
      )}
      
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
                disabled={isLoadingEstados}
              >
                <FormControl>
                  <SelectTrigger>
                    {isLoadingEstados ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Selecione um estado" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {estados.map(estado => (
                    <SelectItem key={estado.id} value={estado.sigla}>
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
