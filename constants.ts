import { FunctionDeclaration, Type } from "@google/genai";

export const FLIGHT_TOOL_NAME = "search_flights";
export const HOTEL_TOOL_NAME = "search_hotels";

export const TOOLS: FunctionDeclaration[] = [
  {
    name: FLIGHT_TOOL_NAME,
    description: "Searches real-time flights with flexible dates, nearby airports in the destination country, max one stopover, and returns options including deep booking links.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        origin: {
          type: Type.STRING,
          description: "Origin airport IATA code, e.g. 'PNQ'."
        },
        destinationCountry: {
          type: Type.STRING,
          description: "ISO 2-letter country code where Yash is willing to land anywhere, e.g. 'EG'."
        },
        departureDate: {
          type: Type.STRING,
          description: "Preferred departure date (YYYY-MM-DD)."
        },
        returnDate: {
          type: Type.STRING,
          description: "Preferred return date (YYYY-MM-DD) or null for one-way.",
          nullable: true
        },
        flexibilityDays: {
          type: Type.INTEGER,
          description: "Days before and after the preferred dates to search.",
        },
        maxStops: {
          type: Type.INTEGER,
          description: "Maximum stops (Yash prefers max 1).",
        },
        maxLayoverHours: {
          type: Type.NUMBER,
          description: "Maximum acceptable layover duration in hours.",
        },
        adults: {
          type: Type.INTEGER,
          description: "Number of adult travellers.",
        },
        cabinClass: {
          type: Type.STRING,
          description: "Cabin class code understood by provider (e.g., 'M' for Economy).",
        }
      },
      required: [
        "origin",
        "destinationCountry",
        "departureDate"
      ]
    }
  },
  {
    name: HOTEL_TOOL_NAME,
    description: "Searches real-time hotel availability and prices for the destination city, restricted by star rating and review score, and returns booking links.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: {
          type: Type.STRING,
          description: "Hotel destination city, e.g. 'Cairo'."
        },
        countryCode: {
          type: Type.STRING,
          description: "ISO 2-letter country code, optional if backend infers it.",
          nullable: true
        },
        checkinDate: {
          type: Type.STRING,
          description: "Check-in date (YYYY-MM-DD)."
        },
        checkoutDate: {
          type: Type.STRING,
          description: "Check-out date (YYYY-MM-DD)."
        },
        minStars: {
          type: Type.INTEGER,
          description: "Minimum star rating.",
        },
        maxStars: {
          type: Type.INTEGER,
          description: "Maximum star rating.",
        },
        minRating: {
          type: Type.NUMBER,
          description: "Minimum guest rating allowed.",
        },
        maxPricePerNight: {
          type: Type.NUMBER,
          description: "Optional max nightly rate filter.",
          nullable: true
        }
      },
      required: [
        "city",
        "checkinDate",
        "checkoutDate"
      ]
    }
  }
];