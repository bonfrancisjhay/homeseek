import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons (known issue with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickHandler({ onChange }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapPicker({ lat, lng, onChange }) {
    const defaultCenter = [12.8797, 121.7740]; // Philippines
    const position      = lat && lng ? [lat, lng] : null;

    return (
        <div>
            <div className="rounded-xl overflow-hidden border border-gray-100" style={{ height: 220 }}>
                <MapContainer
                    center={position || defaultCenter}
                    zoom={position ? 14 : 6}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ClickHandler onChange={onChange} />
                    {position && <Marker position={position} />}
                </MapContainer>
            </div>
            {!position && (
                <p className="text-xs text-gray-400 text-center mt-2">
                    Click the map to drop a pin
                </p>
            )}
            {position && (
                <p className="text-xs text-gray-400 text-center mt-2">
                    📍 {lat.toFixed(5)}, {lng.toFixed(5)} —{' '}
                    <button
                        type="button"
                        className="underline text-[#3b82f6]"
                        onClick={() => onChange(null, null)}
                    >
                        Clear pin
                    </button>
                </p>
            )}
        </div>
    );
}

export default MapPicker;