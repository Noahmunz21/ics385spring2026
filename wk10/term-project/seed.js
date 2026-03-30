require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

const properties = [
  {
    name: "Hana Hideaway B&B",
    island: "Maui",
    type: "B&B",
    description: "A secluded retreat nestled in the lush rainforests of Hana, offering an authentic off-the-beaten-path Maui experience.",
    amenities: ["Ocean View", "Private Lanai", "Farm-to-Table Breakfast", "Hiking Trails", "Waterfall Access"],
    targetSegment: "Eco-tourists",
    imageURL: "https://example.com/hana-hideaway.jpg"
  },
  {
    name: "Kaanapali Local Lodge",
    island: "Maui",
    type: "B&B",
    description: "A locally-owned beachside lodge in Kaanapali offering warm Hawaiian hospitality and stunning sunset views.",
    amenities: ["Beach Access", "Surf Rentals", "Breakfast Included", "Outdoor Shower", "Beach Gear"],
    targetSegment: "Beach lovers",
    imageURL: "https://example.com/kaanapali-lodge.jpg"
  },
  {
    name: "Upcountry Maui Farmstay",
    island: "Maui",
    type: "B&B",
    description: "Experience life on a working farm in Kula with panoramic views of the island and fresh local produce every morning.",
    amenities: ["Farm Tours", "Fresh Eggs Daily", "Mountain Views", "Fire Pit", "Star Gazing"],
    targetSegment: "Family travelers",
    imageURL: "https://example.com/upcountry-farmstay.jpg"
  },
  {
    name: "Paia Surfer's Inn",
    island: "Maui",
    type: "B&B",
    description: "A laid-back inn steps from Paia town and world-famous surf breaks, perfect for adventure seekers and water sports enthusiasts.",
    amenities: ["Surf Storage", "Outdoor Rinse Station", "Board Rentals", "Local Restaurant Guide", "Bike Rentals"],
    targetSegment: "Adventure seekers",
    imageURL: "https://example.com/paia-surfers-inn.jpg"
  },
  {
    name: "Wailea Honeymoon Cottage",
    island: "Maui",
    type: "B&B",
    description: "A romantic private cottage in Wailea with a plunge pool, ocean views, and curated honeymoon experiences for couples.",
    amenities: ["Private Plunge Pool", "Ocean View", "Couples Massage", "Champagne Welcome", "Sunset Dinner"],
    targetSegment: "Honeymooners",
    imageURL: "https://example.com/wailea-cottage.jpg"
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas!');
    await Property.deleteMany({});
    console.log('Cleared existing properties...');
    await Property.insertMany(properties);
    console.log('Successfully seeded 5 Maui B&B properties!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDB();
