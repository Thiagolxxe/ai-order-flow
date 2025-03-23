
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressFormProps {
  street: string;
  setStreet: (value: string) => void;
  complement: string;
  setComplement: (value: string) => void;
  neighborhood: string;
  setNeighborhood: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  zipcode: string;
  setZipcode: (value: string) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  street,
  setStreet,
  complement,
  setComplement,
  neighborhood,
  setNeighborhood,
  city,
  setCity,
  state,
  setState,
  zipcode,
  setZipcode
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="street">Rua/Avenida</Label>
          <Input 
            id="street" 
            placeholder="Ex: Av. Paulista, 1578" 
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="complement">Complemento</Label>
          <Input 
            id="complement" 
            placeholder="Ex: Apto 202" 
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input 
            id="neighborhood" 
            placeholder="Ex: Bela Vista" 
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="zipcode">CEP</Label>
          <Input 
            id="zipcode" 
            placeholder="Ex: 01310-200" 
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="col-span-1 sm:col-span-2 space-y-1">
          <Label htmlFor="city">Cidade</Label>
          <Input 
            id="city" 
            placeholder="Ex: São Paulo" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="state">Estado</Label>
          <Input 
            id="state" 
            placeholder="Ex: SP" 
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
