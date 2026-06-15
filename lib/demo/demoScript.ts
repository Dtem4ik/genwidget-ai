// Pre-recorded landing demo — replayed client-side with no API calls. The tool
// outputs are hardcoded to look great in the widgets.
export interface DemoExchange {
  user: string;
  toolName: string;
  toolCallId: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  reply: string;
}

export const DEMO_SCRIPT: DemoExchange[] = [
  {
    user: "show me 2-bedroom apartments in Tel Aviv",
    toolName: "showApartments",
    toolCallId: "demo-apartments",
    // 3 stub entries so the streaming skeleton renders the same count it resolves to
    // (3 cards) — no second layout/animation pass when the data swaps in.
    input: { apartments: [{}, {}, {}] },
    output: {
      apartments: [
        {
          title: "Bright 2-room near Rothschild Blvd",
          location: "Lev HaIr, Tel Aviv",
          rooms: 2,
          area: 64,
          floor: 3,
          totalFloors: 6,
          price: 389000,
          features: ["balcony", "renovated", "elevator"],
          imageQuery: "bright tel aviv apartment living room",
        },
        {
          title: "Sunny flat steps from the beach",
          location: "Kerem HaTeimanim, Tel Aviv",
          rooms: 2,
          area: 58,
          floor: 2,
          totalFloors: 4,
          price: 415000,
          features: ["sea breeze", "renovated"],
          imageQuery: "sunny apartment near the beach",
        },
        {
          title: "Quiet 2-room in leafy Florentin",
          location: "Florentin, Tel Aviv",
          rooms: 2,
          area: 55,
          floor: 1,
          totalFloors: 3,
          price: 352000,
          features: ["garden", "pet-friendly"],
          imageQuery: "cozy florentin apartment interior",
        },
      ],
    },
    reply: "Here are a few standout 2-room options across Tel Aviv.",
  },
  {
    user: "what's the weather in Tel Aviv?",
    toolName: "getWeather",
    toolCallId: "demo-weather",
    input: { city: "Tel Aviv", units: "celsius" },
    output: {
      city: "Tel Aviv, Israel",
      temperature: 25,
      feelsLike: 26,
      weatherCode: 2,
      windspeed: 12,
      humidity: 60,
      units: "celsius",
    },
    reply: "Mild and partly cloudy — a pleasant 25°C right now.",
  },
];
