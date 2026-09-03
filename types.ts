
export interface Source {
  title: string;
  uri: string;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

export interface WeatherData {
  location: string;
  currentTemp: number;
  currentWeatherCode: number;
  daily: DailyForecast[];
}

export interface ConflictOption {
  id?: string;
  label: string;
  badge?: string;
  detail?: string;
  prompt: string;
}

export interface ConflictChoiceData {
  type: 'conflict_choice';
  conflictTitle: string;
  conflictDescription: string;
  question: string;
  options: ConflictOption[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number | string;
  sources?: Source[];
  weather?: WeatherData;
  isLoading?: boolean;
  conflict?: ConflictChoiceData;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  conflict?: ConflictChoiceData;
}

export interface ChatState {
  messages: Message[];
  isThinking: boolean;
}

export interface TravelDestination {
  name: string;
  image: string;
  description: string;
}

export interface SavedTrip {
  id: string;
  content: string;
  timestamp: number;
  title: string;
}

export interface LoyaltyProgram {
  id?: string;
  provider: string;
  membershipId: string;
  program?: string;
  balance?: number;
  color?: string;
}

export interface LoyaltyAccount {
  id?: string;
  program: string;
  balance: number;
  color?: string;
  membershipId?: string;
}

export interface UserPreferences {
  dietary?: string;
  seatPreference?: 'aisle' | 'window' | 'any';
  cabinClass?: 'economy' | 'premium' | 'business' | 'first';
  preferredAirlines?: string;
  preferredHotelChains?: string;
  travelPace?: 'fast' | 'balanced' | 'relaxed';
  budgetPriority?: 'budget' | 'value' | 'luxury';
  travelVibe?: 'city' | 'nature' | 'adventure' | 'mix';
  askOnConflict?: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  preferences: UserPreferences;
  loyaltyPrograms: LoyaltyProgram[];
}

export interface Strategy {
  type: 'value' | 'premium' | 'points' | 'balanced';
  title: string;
  total_cash: number;
  total_points: number;
  rationale: string;
  flightChoice?: string;
  hotelChoice?: string;
}

export interface ResearchEntry {
  id: string;
  category: 'flight' | 'hotel' | 'points';
  provider: string;
  price: number;
  points_price?: number;
  cpp?: number;
  title: string;
  metadata?: any;
}

export interface Activity {
  id: string;
  title: string;
  time: string;
  category: 'food' | 'culture' | 'adventure' | 'chill' | 'transit' | 'stay';
  location: string;
  description: string;
  cost: number;
  durationMinutes: number;
  insiderTip?: string;
  completed?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  theme: string;
  notes?: string;
  activities: Activity[];
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
  quantity: number;
  packed: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'stay' | 'food' | 'transit' | 'activities' | 'shopping' | 'other';
  date: string;
  notes?: string;
}

export interface BrainNote {
  id: string;
  text?: string;
  content?: string;
  type: 'booking' | 'recommendation' | 'scratchpad' | 'link';
  tags?: string[];
  extractedTags?: string[];
  createdAt: string;
}

export interface CulturalPhrase {
  original: string;
  phonetic: string;
  english: string;
}

export interface CulturalInsight {
  emergencyNumbers: {
    police: string;
    ambulance: string;
    general: string;
  };
  etiquette: string[];
  phrases: CulturalPhrase[];
  localHacks: string[];
  powerPlugInfo: string;
  tippingCulture: string;
  weatherSummary: string;
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  dates: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  heroImage?: string;
  travelStyle: 'cultural' | 'foodie' | 'balanced' | 'luxury' | 'adventure' | 'backpacker';
  pace: 'relaxed' | 'moderate' | 'fast-paced';
  totalBudget: number;
  currency: string;
  currencySymbol: string;
  status: 'planning' | 'decided' | 'archived';
  travellers?: string;
  cabinPreference?: string;
  hotelPreference?: string;
  researchInbox: ResearchEntry[];
  strategies: Strategy[];
  decisionLog: string[];
  itinerary: ItineraryDay[];
  packingList: PackingItem[];
  expenses: Expense[];
  brainNotes: BrainNote[];
  culturalInsights?: CulturalInsight;
}

export interface TravelOSState {
  profile: {
    loyalty: LoyaltyAccount[];
  };
  trips: Trip[];
}

export interface TripPlan {
  destination: string;
  dates: string;
  totalEstimatedCost?: number;
  flights?: any[];
  hotels?: any[];
  itinerary?: any[];
}

export interface FlightOption {
  Option_Type: string;
  Total_Price_USD: number;
  Airline?: string;
  Flight_Number?: string;
  Departure_Time?: string;
  Arrival_Time?: string;
  Duration?: string;
  Stops?: number;
  [key: string]: any;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
}

export interface Hotel {
  id: string;
  name: string;
  stars: number;
  rating: number;
  pricePerNight?: number;
  price?: number;
  address?: string;
  city?: string;
  image?: string;
  amenities?: string[];
}

export interface FlightData {
  type: 'flight';
  airline: string;
  flightNumber: string;
  departure: string;
  arrival?: string;
  duration: string;
  price: number;
  stops: string;
  tags?: string[];
}

export interface HotelData {
  type: 'hotel';
  name: string;
  stars: number;
  rating?: number;
  price: number;
  address?: string;
  amenities?: string[];
  description?: string;
}

