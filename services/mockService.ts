import { Flight, Hotel } from '../types';

const AIRLINES = ['Emirates', 'Qatar Airways', 'Lufthansa', 'British Airways', 'Air France', 'Delta', 'United'];
const CITIES_TO_AIRPORTS: Record<string, string> = {
  'EG': 'CAI',
  'FR': 'CDG',
  'US': 'JFK',
  'JP': 'HND',
  'GB': 'LHR',
  'DE': 'FRA'
};

const HOTEL_NAMES = ['Grand Hyatt', 'Marriott Marquis', 'Four Seasons', 'InterContinental', 'The Ritz-Carlton', 'Hilton Garden Inn'];

// Helper to generate random time
const randomTime = () => {
  const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
};

// Helper to add duration to time roughly
const addTime = (time: string, hoursToAdd: number) => {
  const [h, m] = time.split(':').map(Number);
  let newH = (h + Math.floor(hoursToAdd)) % 24;
  return `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export const mockSearchFlights = (args: any): Flight[] => {
  const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 flights
  const flights: Flight[] = [];
  const destCode = CITIES_TO_AIRPORTS[args.destinationCountry] || 'DXB';
  const origin = args.origin || 'LHR';

  for (let i = 0; i < count; i++) {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const price = Math.floor(Math.random() * 500) + 400;
    const dep = randomTime();
    const duration = Math.floor(Math.random() * 8) + 4;
    
    flights.push({
      id: `fl_${Math.random().toString(36).substr(2, 9)}`,
      airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`,
      origin: origin,
      destination: destCode,
      departureTime: dep,
      arrivalTime: addTime(dep, duration),
      duration: `${duration}h ${Math.floor(Math.random() * 59)}m`,
      price,
      currency: 'USD',
      stops: Math.random() > 0.7 ? 1 : 0,
      bookingLink: '#'
    });
  }
  return flights;
};

export const mockSearchHotels = (args: any): Hotel[] => {
  const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 hotels
  const hotels: Hotel[] = [];
  const city = args.city || 'Unknown City';

  for (let i = 0; i < count; i++) {
    const baseName = HOTEL_NAMES[Math.floor(Math.random() * HOTEL_NAMES.length)];
    const stars = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
    const price = Math.floor(Math.random() * 300) + 150;
    
    hotels.push({
      id: `ht_${Math.random().toString(36).substr(2, 9)}`,
      name: `${baseName} ${city}`,
      city: city,
      rating: Number((Math.random() * 1.5 + 8.0).toFixed(1)),
      stars,
      pricePerNight: price,
      currency: 'USD',
      image: `https://picsum.photos/400/300?random=${i}`,
      bookingLink: '#'
    });
  }
  return hotels;
};