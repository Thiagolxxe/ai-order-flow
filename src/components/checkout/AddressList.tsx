
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckIcon } from 'lucide-react';
import { Address } from './types';

interface AddressListProps {
  addresses: Address[];
  selectedAddress: string;
  setSelectedAddress: (addressId: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({
  addresses,
  selectedAddress,
  setSelectedAddress
}) => {
  return (
    <RadioGroup 
      value={selectedAddress}
      onValueChange={setSelectedAddress}
      className="space-y-3"
    >
      {addresses.map(address => (
        <div key={address.id} className="flex items-start space-x-3">
          <RadioGroupItem value={address.id} id={`address-${address.id}`} />
          <div className="flex-1 border rounded-lg p-3">
            <Label 
              htmlFor={`address-${address.id}`}
              className="flex justify-between cursor-pointer"
            >
              <span className="font-medium">{address.label}</span>
              {selectedAddress === address.id && (
                <CheckIcon className="h-4 w-4 text-primary" />
              )}
            </Label>
            <p className="text-sm text-foreground/70 mt-1">{address.street}, {address.complement || ''}</p>
            <p className="text-sm text-foreground/70">{address.neighborhood}, {address.city} - {address.state}</p>
            <p className="text-sm text-foreground/70">CEP: {address.zipcode}</p>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};

export default AddressList;
