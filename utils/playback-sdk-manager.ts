import { useEffect, useState, useRef } from 'react';

export const usePlaybackSDKManager = ({ token }: { token: string }) => {
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null); // Utilisation de useRef pour stocker l'instance du player

  useEffect(() => {
    if (!token) return; // S'assurer que le token est présent avant de procéder

    const script = document.createElement('script');
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    const handleSDKReady = () => {
      // Créer une instance du player et la stocker dans playerRef
      const player = new (window as any).Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb: (token: string) => void) => cb(token),
      });

      player.addListener('ready', ({ device_id }: any) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      player.addListener('initialization_error', ({ message }: any) => {
        console.error('Initialization error', message);
        setError(message);
      });

      player.addListener('authentication_error', ({ message }: any) => {
        console.error('Authentication error', message);
        setError(message);
      });

      player.addListener('account_error', ({ message }: any) => {
        console.error('Account error', message);
        setError(message);
      });

      player.addListener('playback_error', ({ message }: any) => {
        console.error('Playback error', message);
        setError(message);
      });

      player.connect();
      playerRef.current = player; // Stocker le player dans playerRef

      return () => {
        player.disconnect(); // Déconnecter le player lors du démontage du composant
      };
    };

    (window as any).onSpotifyWebPlaybackSDKReady = handleSDKReady;

    return () => {
      script.remove();
    };
  }, [token]);

  // Retourner l'état et le player pour l'utiliser dans d'autres composants
  return { isReady, deviceId, error, player: playerRef.current };
};