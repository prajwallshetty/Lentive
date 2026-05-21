export interface MockLocation {
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export const MOCK_LOCATIONS: MockLocation[] = [
  {
    name: 'Union Square (SF Downtown)',
    address: 'Union Square, San Francisco, CA',
    coordinates: [-122.4089, 37.7879]
  },
  {
    name: 'The Castro (SF Central-West)',
    address: 'The Castro, San Francisco, CA',
    coordinates: [-122.4316, 37.7699]
  },
  {
    name: 'Civic Center (SF Central)',
    address: 'Civic Center, San Francisco, CA',
    coordinates: [-122.4194, 37.7749]
  },
  {
    name: 'SOMA (SF East)',
    address: 'SOMA, San Francisco, CA',
    coordinates: [-122.4010, 37.7785]
  },
  {
    name: 'Golden Gate Park (SF West)',
    address: 'Golden Gate Park, San Francisco, CA',
    coordinates: [-122.4862, 37.7694]
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
