/**
 * Offline Tile Layer Component
 * Provides automatic and manual control for online/offline map tiles
 * 
 * @author CHOUABBIA Amine
 * @created 12-25-2025
 * @updated 12-25-2025
 */

import { useEffect, useState } from 'react';
import { TileLayer } from 'react-leaflet';

interface OfflineTileLayerProps {
  /** URL pattern for offline tiles (e.g., '/tiles/algeria/{z}/{x}/{y}.png') */
  offlineUrl?: string;
  /** URL pattern for online tiles */
  onlineUrl?: string;
  /** Map attribution text */
  attribution?: string;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Manually force offline mode */
  forceOffline?: boolean;
  /** Callback when offline tiles availability changes */
  onOfflineAvailabilityChange?: (available: boolean) => void;
}

/**
 * Tile layer that switches between online and offline tiles
 * based on network connectivity, tile availability, and user preference
 */
export const OfflineTileLayer: React.FC<OfflineTileLayerProps> = ({
  offlineUrl = '/tiles/algeria/{z}/{x}/{y}.png',
  onlineUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom = 12,
  minZoom = 6,
  forceOffline = false,
  onOfflineAvailabilityChange
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineTilesAvailable, setOfflineTilesAvailable] = useState(false);
  const [useOffline, setUseOffline] = useState(false);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      console.log('Network: Online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('Network: Offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if offline tiles are available
    // Test with a sample tile (zoom 6, center of Algeria)
    const testTileUrl = offlineUrl
      .replace('{z}', '6')
      .replace('{x}', '30')
      .replace('{y}', '20');

    fetch(testTileUrl, { method: 'HEAD' })
      .then((response) => {
        if (response.ok) {
          console.log('Offline tiles: Available');
          setOfflineTilesAvailable(true);
          onOfflineAvailabilityChange?.(true);
        } else {
          console.log('Offline tiles: Not available');
          setOfflineTilesAvailable(false);
          onOfflineAvailabilityChange?.(false);
        }
      })
      .catch(() => {
        console.log('Offline tiles: Not found');
        setOfflineTilesAvailable(false);
        onOfflineAvailabilityChange?.(false);
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineUrl, onOfflineAvailabilityChange]);

  useEffect(() => {
    // Determine which tiles to use
    if (!isOnline) {
      // Must use offline when network is down
      setUseOffline(true);
    } else if (forceOffline && offlineTilesAvailable) {
      // User manually selected offline mode and tiles are available
      setUseOffline(true);
    } else {
      // Use online tiles
      setUseOffline(false);
    }
  }, [isOnline, offlineTilesAvailable, forceOffline]);

  const tileUrl = useOffline ? offlineUrl : onlineUrl;

  console.log('TileLayer mode:', useOffline ? 'OFFLINE' : 'ONLINE');
  console.log('Force offline:', forceOffline);
  console.log('Tile URL:', tileUrl);

  return (
    <TileLayer
      key={tileUrl} // Force re-render when URL changes
      attribution={attribution}
      url={tileUrl}
      maxZoom={maxZoom}
      minZoom={minZoom}
      crossOrigin={true}
      // Fallback for missing tiles
      errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    />
  );
};
