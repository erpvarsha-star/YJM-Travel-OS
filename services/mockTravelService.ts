import { Flight, Hotel } from '../types';

// Random integer helper
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mock Flight Search
export const searchFlightsMock = (origin: string, destination: string, date: string): Flight[] => {
  const airlines = ['Air India', 'IndiGo', 'Emirates', 'Lufthansa', 'Qatar Airways'];
  
  return Array.from({ length: 3 }).map((_, i) => {
    const airline = airlines[getRandomInt(0, airlines.length - 1)];
    const price = getRandomInt(25000, 85000);
    const durationHours = getRandomInt(4, 16);
    
    return {
      id: `fl-${Math.random().toString(36).substr(2, 9)}`,
      airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${getRandomInt(100, 999)}`,
      departureTime: `${getRandomInt(0, 23)}:${getRandomInt(0, 5)}0`,
      arrivalTime: `${getRandomInt(0, 23)}:${getRandomInt(0, 5)}0`,
      duration: `${durationHours}h ${getRandomInt(0, 5)}0m`,
      price,
      stops: durationHours > 8 ? 1 : 0
    };
  });
};

// Mock Hotel Search
export const searchHotelsMock = (
  city: string, 
  stars: number = 4, 
  minReviewScore: number = 8.0, 
  sortOrder: 'price_asc' | 'price_desc' = 'price_asc'
): Hotel[] => {
  const hotelNames = [
    `Grand ${city} Palace`,
    `${city} International Hotel`,
    `The Royal ${city} Suites`,
    `Hyatt Regency ${city}`,
    `Marriott ${city} Downtown`,
    `Taj ${city} Towers`,
    `The Oberoi ${city}`,
    `Lemon Tree Premier ${city}`
  ];

  // 1. Generate a larger pool of hotels to enable meaningful sorting/filtering
  const poolSize = 8;
  const hotelPool: Hotel[] = Array.from({ length: poolSize }).map((_, i) => {
    const name = hotelNames[i % hotelNames.length]; 
    // Generate rating between 7.0 and 9.8 to test filtering
    const rating = parseFloat((Math.random() * (9.8 - 7.0) + 7.0).toFixed(1)); 
    const price = getRandomInt(6000, 35000);

    return {
      id: `ht-${Math.random().toString(36).substr(2, 9)}`,
      name,
      stars: getRandomInt(stars, 5),
      rating,
      pricePerNight: price,
      address: `Centrally located in ${city}`,
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Breakfast Included', 'Gym', 'City View'].slice(0, getRandomInt(3, 5)),
      imageUrl: `https://picsum.photos/400/300?random=${i}`
    };
  });

  // 2. Filter by Rating (Strict 8.0+ Rule)
  const filteredHotels = hotelPool.filter(h => h.rating >= minReviewScore);

  // 3. Sort by Price
  filteredHotels.sort((a, b) => {
    if (sortOrder === 'price_desc') {
      return b.pricePerNight - a.pricePerNight;
    }
    return a.pricePerNight - b.pricePerNight; // Default price_asc
  });

  // 4. Return top 3-4 results
  return filteredHotels.slice(0, 3);
};