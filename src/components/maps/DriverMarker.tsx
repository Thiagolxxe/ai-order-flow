
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bicycle } from 'lucide-react';

// Create a custom driver icon
const driverIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div class="bg-blue-500 p-2 rounded-full text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bicycle"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

interface DriverMarkerProps {
  position: [number, number];
  name: string;
  status?: string;
  eta?: string;
}

const DriverMarker: React.FC<DriverMarkerProps> = ({ position, name, status = 'A caminho', eta }) => {
  return (
    <Marker position={position} icon={driverIcon}>
      <Popup>
        <div className="text-sm">
          <h3 className="font-medium">{name}</h3>
          <p className="text-gray-600">Status: {status}</p>
          {eta && <p className="text-gray-600">Tempo estimado: {eta}</p>}
        </div>
      </Popup>
    </Marker>
  );
};

export default DriverMarker;
