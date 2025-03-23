
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AddressList from './AddressList';
import AddressForm from './AddressForm';
import { Address } from './types';

interface DeliverySectionProps {
  isAuthenticated: boolean;
  addresses: Address[];
  selectedAddress: string;
  setSelectedAddress: (addressId: string) => void;
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

const DeliverySection: React.FC<DeliverySectionProps> = ({
  isAuthenticated,
  addresses,
  selectedAddress,
  setSelectedAddress,
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
    <Card>
      <CardContent className="p-6">
        <h2 className="font-medium mb-4 text-lg">Endereço de Entrega</h2>
        
        {isAuthenticated && addresses.length > 0 ? (
          <AddressList 
            addresses={addresses}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
          />
        ) : (
          <AddressForm
            street={street}
            setStreet={setStreet}
            complement={complement}
            setComplement={setComplement}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
            zipcode={zipcode}
            setZipcode={setZipcode}
          />
        )}
        
        {isAuthenticated ? (
          <Button variant="link" className="mt-3 h-8 p-0">
            + Adicionar novo endereço
          </Button>
        ) : (
          <Button variant="link" className="mt-3 h-8 p-0" asChild>
            <Link to="/login?redirect=/finalizar">
              Fazer login para usar endereços salvos
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliverySection;
