/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
// leaflet maps imports
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { Loader2 } from 'lucide-react';                  // icons library auto installed with shadcn
// shadcn components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


const fallbackCoords: [number, number] = [30.033333, 31.233334];       // Cairo (change to your preferred default location)

// (Leaflet’s default marker icon must be set manually when using with bundlers like Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// SearchControl function (subComponent) to add a searchbar functionality
function SearchControl({ onResult }: { onResult: (latlng: [number, number]) => void }) {
  const map = useMapEvents({});                   // useMap hook to access the map instance
  useEffect(() => {    
    const searchControl = new (GeoSearchControl as any)({ provider: new OpenStreetMapProvider(), showMarker: true, autoClose: true, retainZoomLevel: false });
    map.addControl(searchControl);
    map.on('geosearch/showlocation', (result: any) => { const { x, y } = result.location; onResult([y, x]); });

    return () => { map.removeControl(searchControl); };     // Cleanup on unmount
  }, [map, onResult]);

  return null;
}

// LocationPicker function (subComponent) to handle map clicks and set coordinates
function LocationPicker({ setLatlng }: { setLatlng: (coords: [number, number]) => void }) { 
  useMapEvents({ click: (e) => setLatlng([e.latlng.lat, e.latlng.lng]) });
  return null;
}


// MapDialog Main Component to display the map in a shadcn dialog and handle location selection
const MapDialog = ({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (address: {
       latlng: [number, number]; streetAddress: string; city: string; country: string; postalCode: string; }) => void;}) => {
  
  // States to manage coordinates, address fields values, and loading state
  const [latlng, setLatlng] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState({ streetAddress: '', city: '', country: '', postalCode: '' });
  const [loading, setLoading] = useState(false);

  // Function to fetch readable Address values from coordinates(lat/lng) using reverse geocoding [OpenStreetMap Nominatim API]
  const fetchAddress = async (coords: [number, number]) => {
    try {
      // API request to fetch the reverse geocoded address based on coordinates
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords[0]}&lon=${coords[1]}&format=json`);
      const data = await res.json();
      const { address } = data;
      console.log('Fetched address:', address);  
      // Update address state with the fetched data
      setAddress({ streetAddress: `${address.house_number || ''} - ${address.road || ''}` || '', city: address.city || address.town || address.village || address.neighbourhood || '', country: address.country || '', postalCode: address.postcode || '' });
    } catch (error) {
      console.error('Reverse geocoding failed:', error);            // Handle error 
    }
  };
  

  // Effect to handle geolocation when the dialog opens
  useEffect(() => {
    // If the dialog is open, try to get the user's current location, otherwise reset the Address state
    if (open) {
      setLoading(true);                              // Set loading state to true while fetching location
      // check the geolocation API, then get the user's current location 
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [ position.coords.latitude, position.coords.longitude ];
            setLatlng(coords);                // Set the coordinates state with the fetched position
            fetchAddress(coords);             // call the Fetch address function and pass the coordinates
            setLoading(false);                // Set loading state to false after it
          },
          // If geolocation permission fails / not supported in browser, fallback to a default location
          (error) => {
            console.warn('Geolocation error:', error);
            setLatlng(fallbackCoords);
            fetchAddress(fallbackCoords);
            setLoading(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        console.warn('Geolocation not supported.');
        setLatlng(fallbackCoords);
        fetchAddress(fallbackCoords);
        setLoading(false);
      }
    } else {
      // Reset the Address & coordinates states when dialog is closed
      setLatlng(null);
      setAddress({ streetAddress: '', city: '', country: '', postalCode: '' });
    }
  }, [open]);


  // Effect to fetch address when coordinates state change
  useEffect(() => {
    if (latlng) { fetchAddress(latlng); }
  }, [latlng]);


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full h-[500px]">
        {/* Dialog Header title */}
        <DialogHeader>
          <DialogTitle>Choose Your Location</DialogTitle>
        </DialogHeader>

        {/* if loading or no coordinates, show a loading indicator */}
        {loading || !latlng ? (
          <div className="flex items-center justify-center h-[200px] w-full">
            <Loader2 className="animate-spin h-6 w-6 mr-2" />
            <span>Fetching your location...</span>
          </div>
        ) : (
          <>
          {/* Map container with search control and location picker (subcomponents) */}
            <MapContainer center={latlng} zoom={13} scrollWheelZoom={true} className="h-[200px] w-full rounded-md">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <SearchControl onResult={(coords) => setLatlng(coords)} />
              <Marker position={latlng} />
              <LocationPicker setLatlng={setLatlng} />
            </MapContainer>

            {/* Display the selected address values details */}
            <div className="text-sm text-muted-foreground mt-2 space-y-1">
              <div>📍 Street: {address.streetAddress}</div>
              <div>🏙️ City: {address.city}</div>
              <div>🌍 Country: {address.country}</div>
              <div>📮 Postal Code: {address.postalCode}</div>              
            </div>

            {/* Confirm and Cancel buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}> Cancel </Button>
              <Button onClick={() => onConfirm({ latlng, ...address })}>Confirm</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MapDialog;

