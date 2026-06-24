import { PrismaClient, PlaceStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const categories = [
  { name: "Hill Stations", slug: "hill-stations", icon: "⛰️", description: "Scenic mountain retreats and cool climates" },
  { name: "Beaches", slug: "beaches", icon: "🏖️", description: "Sun, sand, and sea destinations" },
  { name: "Historical Places", slug: "historical-places", icon: "🏛️", description: "Ancient monuments and heritage sites" },
  { name: "Temples", slug: "temples", icon: "🛕", description: "Sacred temples and religious sites" },
  { name: "Lakes", slug: "lakes", icon: "🌊", description: "Serene lakes and water bodies" },
  { name: "Waterfalls", slug: "waterfalls", icon: "💧", description: "Majestic waterfalls and cascades" },
  { name: "Adventure", slug: "adventure", icon: "🧗", description: "Trekking, rafting, and adventure sports" },
  { name: "Wildlife", slug: "wildlife", icon: "🐯", description: "National parks and wildlife sanctuaries" },
  { name: "Religious Sites", slug: "religious-sites", icon: "🕌", description: "Pilgrimage and spiritual destinations" },
  { name: "Hidden Gems", slug: "hidden-gems", icon: "💎", description: "Off-the-beaten-path destinations" },
];

const places = [
  {
    title: "Manali",
    slug: "manali",
    shortDescription: "A picturesque hill station nestled in the Himalayan mountains of Himachal Pradesh.",
    description: "Manali is a high-altitude Himalayan resort town and a popular destination for honeymooners and adventure seekers. Located at the northern end of Kullu Valley in Himachal Pradesh, it sits at an elevation of 2,050 m. The town is blessed with stunning scenery including snow-capped mountains, lush forests, and the Beas River. Rohtang Pass, Solang Valley, and Old Manali are among its top attractions.",
    city: "Manali",
    state: "Himachal Pradesh",
    country: "India",
    latitude: 32.2396,
    longitude: 77.1887,
    bestTimeToVisit: "October to June",
    entryFee: "Free",
    openingHours: "Open all day",
    travelTips: "Carry warm clothes even in summer. Roads to Rohtang Pass close during heavy snowfall. Book accommodation in advance during peak season.",
    thingsToDo: "Skiing at Solang Valley, visiting Rohtang Pass, river rafting on Beas, exploring Old Manali, visiting Hadimba Devi Temple",
    nearbyAttractions: "Rohtang Pass (51 km), Solang Valley (14 km), Kasol (76 km), Kullu (40 km)",
    featuredImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    status: PlaceStatus.APPROVED,
    averageRating: 4.7,
    views: 15420,
    categorySlug: "hill-stations",
  },
  {
    title: "Taj Mahal",
    slug: "taj-mahal",
    shortDescription: "The iconic white marble mausoleum and one of the Seven Wonders of the World.",
    description: "The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in Agra, Uttar Pradesh. It was commissioned in 1631 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal. The tomb is the centrepiece of a 17-hectare complex, which includes a mosque and a guest house, and is set in formal gardens bounded on three sides by a crenellated wall.",
    city: "Agra",
    state: "Uttar Pradesh",
    country: "India",
    latitude: 27.1751,
    longitude: 78.0421,
    bestTimeToVisit: "October to March",
    entryFee: "₹250 for Indians, ₹1300 for foreigners",
    openingHours: "6 AM – 6:30 PM (closed on Fridays)",
    travelTips: "Visit at sunrise for the best experience and fewer crowds. Photography inside the main mausoleum is not allowed. Hire a local guide for a deeper understanding of its history.",
    thingsToDo: "Viewing the main mausoleum, exploring the mosque, walking the gardens, visiting the museum, watching sunrise/sunset",
    nearbyAttractions: "Agra Fort (2.5 km), Fatehpur Sikri (40 km), Mehtab Bagh (1 km)",
    featuredImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
    status: PlaceStatus.APPROVED,
    averageRating: 4.9,
    views: 52300,
    categorySlug: "historical-places",
  },
  {
    title: "Goa Beaches",
    slug: "goa-beaches",
    shortDescription: "India's beach capital with pristine shores, water sports, and vibrant nightlife.",
    description: "Goa is India's smallest state but one of its most vibrant destinations. Famous for its spectacular beaches, Portuguese heritage, and lively nightlife, Goa attracts millions of tourists every year. From the party beaches of North Goa like Baga and Calangute to the serene shores of South Goa like Palolem and Agonda, there's a beach for every kind of traveler.",
    city: "Panaji",
    state: "Goa",
    country: "India",
    latitude: 15.2993,
    longitude: 74.1240,
    bestTimeToVisit: "November to February",
    entryFee: "Free",
    openingHours: "Open all day",
    travelTips: "Avoid peak season (December–January) to escape crowds. North Goa is better for nightlife, South Goa for relaxation. Rent a scooter to explore at your own pace.",
    thingsToDo: "Swimming, water sports, beach parties, trying seafood, visiting churches, exploring night markets",
    nearbyAttractions: "Basilica of Bom Jesus, Fort Aguada, Dudhsagar Waterfalls, Anjuna Flea Market",
    featuredImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    status: PlaceStatus.APPROVED,
    averageRating: 4.5,
    views: 38900,
    categorySlug: "beaches",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created");

  // Create admin user
  const adminPassword = await bcrypt.hash("Mahimash@123", 12);
  const admin = await db.user.upsert({
    where: { email: "ourpersonalspace0510@gmail.com" },
    update: { password: adminPassword, role: UserRole.ADMIN, emailVerified: new Date() },
    create: {
      name: "Admin",
      email: "ourpersonalspace0510@gmail.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user created (email: ourpersonalspace0510@gmail.com)");

  // Create demo user
  const userPassword = await bcrypt.hash("user123456", 12);
  const demoUser = await db.user.upsert({
    where: { email: "demo@traveldiary.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@traveldiary.com",
      password: userPassword,
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Demo user created (email: demo@traveldiary.com, password: user123456)");

  // Create places
  for (const placeData of places) {
    const { categorySlug, ...rest } = placeData;
    const category = await db.category.findUnique({ where: { slug: categorySlug } });
    if (!category) continue;

    await db.place.upsert({
      where: { slug: rest.slug },
      update: {},
      create: {
        ...rest,
        categoryId: category.id,
        userId: admin.id,
      },
    });
  }
  console.log("✅ Sample places created");

  // Create sample reviews
  const approvedPlaces = await db.place.findMany({ where: { status: PlaceStatus.APPROVED } });
  for (const place of approvedPlaces) {
    await db.review.upsert({
      where: { userId_placeId: { userId: demoUser.id, placeId: place.id } },
      update: {},
      create: {
        rating: 5,
        title: "Amazing place!",
        body: "This is truly one of the most beautiful places I've ever visited. The views are breathtaking and the local culture is fascinating. Highly recommend visiting!",
        userId: demoUser.id,
        placeId: place.id,
      },
    });
  }
  console.log("✅ Sample reviews created");

  // Seed badges
  const BADGES = [
    { slug: "mountain-explorer", name: "Mountain Explorer", description: "Contributed 10 approved mountain destinations", icon: "⛰️", type: "EXPLORER", rarity: "RARE" },
    { slug: "temple-hunter", name: "Temple Hunter", description: "Contributed 15 approved religious places", icon: "🛕", type: "EXPLORER", rarity: "RARE" },
    { slug: "beach-lover", name: "Beach Lover", description: "Contributed 10 approved beach destinations", icon: "🏖️", type: "EXPLORER", rarity: "COMMON" },
    { slug: "waterfall-seeker", name: "Waterfall Seeker", description: "Contributed 10 approved waterfall destinations", icon: "💧", type: "EXPLORER", rarity: "RARE" },
    { slug: "adventure-master", name: "Adventure Master", description: "Contributed 20 approved adventure destinations", icon: "🧗", type: "EXPLORER", rarity: "EPIC" },
    { slug: "hidden-gem-discoverer", name: "Hidden Gem Discoverer", description: "Contributed 5 places marked as Hidden Gems", icon: "💎", type: "EXPLORER", rarity: "EPIC" },
    { slug: "weekend-traveler", name: "Weekend Traveler", description: "Contributed 25 approved places", icon: "🗺️", type: "EXPLORER", rarity: "RARE" },
    { slug: "nature-enthusiast", name: "Nature Enthusiast", description: "Contributed 30 nature destinations", icon: "🌿", type: "EXPLORER", rarity: "EPIC" },
    { slug: "road-trip-expert", name: "Road Trip Expert", description: "Contributed 20 road-trip destinations", icon: "🚗", type: "EXPLORER", rarity: "RARE" },
    { slug: "first-contribution", name: "First Contribution", description: "Made your first approved place contribution", icon: "🌟", type: "COMMUNITY", rarity: "COMMON" },
    { slug: "rising-star", name: "Rising Star", description: "Received 100 likes on your reviews", icon: "⭐", type: "COMMUNITY", rarity: "RARE" },
    { slug: "top-contributor", name: "Top Contributor", description: "Contributed 100 approved places", icon: "🏆", type: "COMMUNITY", rarity: "LEGENDARY" },
    { slug: "community-hero", name: "Community Hero", description: "500 helpful contributions to the community", icon: "🦸", type: "COMMUNITY", rarity: "LEGENDARY" },
    { slug: "photo-master", name: "Photo Master", description: "100 approved photos uploaded", icon: "📸", type: "COMMUNITY", rarity: "EPIC" },
    { slug: "review-expert", name: "Review Expert", description: "100 approved reviews written", icon: "✍️", type: "COMMUNITY", rarity: "EPIC" },
    { slug: "trusted-contributor", name: "Trusted Contributor", description: "Maintained 95% approval rate", icon: "✅", type: "COMMUNITY", rarity: "LEGENDARY" },
  ];

  for (const badge of BADGES) {
    await db.badge.upsert({
      where: { slug: badge.slug },
      create: badge,
      update: { name: badge.name, description: badge.description, icon: badge.icon },
    });
  }
  console.log("✅ Badges seeded");

  // Seed rewards
  await db.reward.upsert({
    where: { slug: "green-traveler-plant" },
    create: {
      slug: "green-traveler-plant",
      name: "Green Traveler Plant",
      description: "Redeem 2000 coins and receive a complimentary plant as a token of appreciation for helping travelers discover new destinations. A living reminder of your contributions to our travel community.",
      icon: "🌱",
      coinCost: 2000,
      isActive: true,
    },
    update: {},
  });
  console.log("✅ Rewards seeded");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
