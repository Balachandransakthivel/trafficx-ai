// TRAFFICX AI — App Config & Mock Data Config

export const APP_NAME = 'TRAFFICX AI';
export const APP_VERSION = '1.0.0';

// City junctions (lat/lng for Coimbatore demo city)
export const CITY_JUNCTIONS = [
  { id: 'J1', name: 'Junction 1 – Anna Nagar', lat: 11.0168, lng: 77.0061 },
  { id: 'J2', name: 'Junction 2 – RS Puram', lat: 11.0005, lng: 76.9691 },
  { id: 'J3', name: 'Junction 3 – Peelamedu', lat: 11.0104, lng: 77.0432 },
  { id: 'J4', name: 'Junction 4 – Ganapathy', lat: 10.9951, lng: 77.0069 },
  { id: 'J5', name: 'Junction 5 – Singanallur', lat: 10.9752, lng: 77.0330 },
];

export const HOSPITALS = [
  { id: 'H1', name: 'Government Hospital', lat: 11.0100, lng: 77.0155 },
  { id: 'H2', name: 'PSG Hospital', lat: 11.0228, lng: 77.0020 },
  { id: 'H3', name: 'KMCH Hospital', lat: 11.0138, lng: 77.0330 },
];

export const ROADS = [
  { id: 'R1', name: 'Avinashi Road', from: 'J1', to: 'J3' },
  { id: 'R2', name: 'DB Road', from: 'J2', to: 'J4' },
  { id: 'R3', name: 'Trichy Road', from: 'J4', to: 'J5' },
  { id: 'R4', name: 'Mettupalayam Road', from: 'J1', to: 'J2' },
  { id: 'R5', name: 'NH Road', from: 'J3', to: 'J4' },
];
