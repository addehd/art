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
    title: 'Starry Night',
    artist: 'Van Gogh',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    width: 0.9,
    height: 0.71,
  },
  {
    id: '2',
    title: 'Mona Lisa',
    artist: 'da Vinci',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    width: 0.53,
    height: 0.8,
  },
  {
    id: '3',
    title: 'The Great Wave',
    artist: 'Hokusai',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg',
    width: 0.9,
    height: 0.61,
  },
  {
    id: '4',
    title: 'Girl with a Pearl Earring',
    artist: 'Vermeer',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg',
    width: 0.67,
    height: 0.8,
  },
  {
    id: '5',
    title: 'The Scream',
    artist: 'Munch',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
    width: 0.72,
    height: 0.9,
  },
  {
    id: '6',
    title: 'Sunflowers',
    artist: 'Van Gogh',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg/800px-Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg',
    width: 0.73,
    height: 0.9,
  },
  {
    id: '7',
    title: 'Water Lilies',
    artist: 'Monet',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
    width: 0.9,
    height: 0.9,
  },
  {
    id: '8',
    title: 'Birth of Venus',
    artist: 'Botticelli',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
    width: 0.9,
    height: 0.56,
  },
  {
    id: '9',
    title: 'American Gothic',
    artist: 'Grant Wood',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/800px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg',
    width: 0.66,
    height: 0.8,
  },
  {
    id: '10',
    title: 'The Persistence of Memory',
    artist: 'Dalí',
    uri: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
    width: 0.9,
    height: 0.6,
  },
];
