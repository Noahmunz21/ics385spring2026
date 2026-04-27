require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

const properties = [
  {
    name: "Hana Hideaway B&B",
    island: "Maui",
    type: "B&B",
    description: "A secluded retreat nestled in the lush rainforests of Hana.",
    amenities: ["Ocean View", "Private Lanai", "Farm-to-Table Breakfast", "Hiking Trails", "Waterfall Access"],
    targetSegment: "Eco-tourists",
    imageURL: "https://example.com/hana-hideaway.jpg",
    reviews: [
      { guestName: "Kai Kahananui", rating: 5, comment: "Absolutely magical place!" },
      { guestName: "Maya Rosario", rating: 4, comment: "Beautiful and peaceful retreat." }
    ]
  },
  {
    name: "Kaanapali Local Lodge",
    island: "Maui",
    type: "B&B",
    description: "A locally-owned beachside lodge in Kaanapali.",
    amenities: ["Beach Access", "Surf Rentals", "Breakfast Included", "Outdoor Shower", "Beach Gear"],
    targetSegment: "Beach lovers",
    imageURL: "https://example.com/kaanapali-lodge.jpg",
    reviews: [
      { guestName: "Lena Akana", rating: 5, comment: "Best beach location on Maui!" }
    ]
  },
  {
    name: "Upcountry Maui Farmstay",
    island: "Maui",
    type: "B&B",
    description: "Experience life on a working farm in Kula with panoramic views.",
    amenities: ["Farm Tours", "Fresh Eggs Daily", "Mountain Views", "Fire Pit", "Star Gazing"],
    targetSegment: "Family travelers",
    imageURL: "https://example.com/upcountry-farmstay.jpg",
    reviews: []
  },
  {
    name: "Paia Surfer's Inn",
    island: "Maui",
    type: "B&B",
    description: "A laid-back inn steps from Paia town and world-famous surf breaks.",
    amenities: ["Surf Storage", "Outdoor Rinse Station", "Board Rentals", "Local Restaurant Guide", "Bike Rentals"],
    targetSegment: "Adventure seekers",
    imageURL: "https://example.com/paia-surfers-inn.jpg",
    reviews: [
      { guestName: "John Doe", rating: 4, comment: "Perfect spot for surfers!" }
    ]
  },
  {
    name: "Wailea Honeymoon Cottage",
    island: "Maui",
    type: "B&B",
    description: "A romantic private cottage in Wailea with a plunge pool and ocean views.",
    amenities: ["Private Plunge Pool", "Ocean View", "Couples Massage", "Champagne Welcome", "Sunset Dinner"],
    targetSegment: "Honeymooners",
    imageURL: "https://example.com/wailea-cottage.jpg",
    reviews: [
      { guestName: "Jane Smith", rating: 5, comment: "Perfect honeymoon experience!" }
    ]
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas!');
    await Property.deleteMany({});
    console.log('Cleared existing properties...');
    await Property.insertMany(properties);
    console.log('Successfully seeded 5 Maui B&B properties with reviews!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDB();
