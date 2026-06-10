/**
 * Curated radio stations for the music widget.
 *
 * All streams are served by SomaFM (https://somafm.com) — a listener-supported,
 * commercial-free internet radio service whose MP3 streams play directly through
 * a native <audio> element (no API key, no CORS handshake). The selection leans
 * toward ambient / downtempo channels that work well as coding background music.
 */

export interface RadioStation {
  id: string;
  name: string;
  /** Short genre / mood descriptor. */
  description: string;
  /** Direct MP3 stream URL consumed by the <audio> element. */
  streamUrl: string;
  /** Channel page, linked from the widget. */
  homepage: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'groovesalad',
    name: 'Groove Salad',
    description: 'Ambient · downtempo',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    homepage: 'https://somafm.com/groovesalad/',
  },
  {
    id: 'defcon',
    name: 'DEF CON Radio',
    description: 'Music for hacking',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    homepage: 'https://somafm.com/defcon/',
  },
  {
    id: 'dronezone',
    name: 'Drone Zone',
    description: 'Atmospheric · deep',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    homepage: 'https://somafm.com/dronezone/',
  },
  {
    id: 'lush',
    name: 'Lush',
    description: 'Mellow vocals',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    homepage: 'https://somafm.com/lush/',
  },
  {
    id: 'beatblender',
    name: 'Beat Blender',
    description: 'Deep house · downtempo',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    homepage: 'https://somafm.com/beatblender/',
  },
  {
    id: 'spacestation',
    name: 'Space Station Soma',
    description: 'Spaced-out ambient',
    streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
    homepage: 'https://somafm.com/spacestation/',
  },
];

export const DEFAULT_STATION_ID = RADIO_STATIONS[0].id;
