export interface MockLocation {
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export const MOCK_LOCATIONS: MockLocation[] = [
  {
    name: 'Indiranagar (Bengaluru East)',
    address: 'Indiranagar, Bengaluru, Karnataka, India',
    coordinates: [77.6412, 12.9719]
  },
  {
    name: 'Koramangala (Bengaluru South)',
    address: 'Koramangala, Bengaluru, Karnataka, India',
    coordinates: [77.6245, 12.9352]
  },
  {
    name: 'HSR Layout (Bengaluru Southeast)',
    address: 'HSR Layout, Bengaluru, Karnataka, India',
    coordinates: [77.6387, 12.9101]
  },
  {
    name: 'Whitefield (Bengaluru East)',
    address: 'Whitefield, Bengaluru, Karnataka, India',
    coordinates: [77.7499, 12.9698]
  },
  {
    name: 'Malleshwaram (Bengaluru North)',
    address: 'Malleshwaram, Bengaluru, Karnataka, India',
    coordinates: [77.5736, 12.9961]
  },
  {
    name: 'Mangalore (Central)',
    address: 'Hampankatta, Mangalore, Karnataka, India',
    coordinates: [74.8560, 12.9141]
  },
  {
    name: 'Manjeshwar (Kasaragod)',
    address: 'Manjeshwar, Kasaragod, Kerala, India',
    coordinates: [74.8876, 12.7161]
  }
];

export const CATEGORIES = [
  { name: 'All', icon: 'LayoutGrid' },
  { name: 'Tools', icon: 'Wrench' },
  { name: 'Electronics', icon: 'Laptop' },
  { name: 'Vehicles', icon: 'Bike' },
  { name: 'Outdoor', icon: 'Tent' },
  { name: 'Party Supplies', icon: 'PartyPopper' },
  { name: 'Fashion', icon: 'Shirt' }
];
