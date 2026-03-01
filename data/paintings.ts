export interface Painting {
  id: string;
  title: string;
  artist: string;
  uri: string;
  width: number;
  height: number;
}

export const PAINTINGS: Painting[] = [
  {
    id: '1',
    title: 'Untitled 2',
    artist: 'Maria Ocampo',
    uri: 'https://mariaocampo.se/2025/2.webp',
    width: 0.9,
    height: 0.9,
  },
  {
    id: '2',
    title: 'Untitled 1',
    artist: 'Maria Ocampo',
    uri: 'https://mariaocampo.se/2025/1.webp',
    width: 0.9,
    height: 0.9,
  },
  {
    id: '3',
    title: 'Untitled 4',
    artist: 'Maria Ocampo',
    uri: 'https://mariaocampo.se/2025/4.webp',
    width: 0.9,
    height: 0.9,
  },
  {
    id: '4',
    title: 'Untitled 5',
    artist: 'Maria Ocampo',
    uri: 'https://mariaocampo.se/2025/5.webp',
    width: 0.9,
    height: 0.9,
  },
];
