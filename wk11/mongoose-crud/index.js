require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./customerModel');
const Hotel = require('./hotelModel');
const Amenities = require('./amenitiesModel');

// Connection strings
const localURI = 'mongodb://127.0.0.1:27017/myCustomerDB';
const atlasURI = process.env.MONGODB_URI;

async function runCRUD(connectionString, dbType) {
  console.log(`\n========== Connecting to ${dbType} ==========`);
  await mongoose.connect(connectionString);
  console.log(`Connected to ${dbType}!`);

  // ---- CUSTOMER CRUD ----
  console.log('\n--- Customer Operations ---');
  await Customer.deleteMany({});
  console.log('Cleared existing customers');

  await Customer.insertMany([
    { firstName: 'John', lastName: 'Doe', email: `john.doe.${dbType}@example.com`, phone: '808-555-0101' },
    { firstName: 'Jane', lastName: 'Smith', email: `jane.smith.${dbType}@example.com`, phone: '808-555-0102' },
    { firstName: 'Kai', lastName: 'Kahananui', email: `kai.kahananui.${dbType}@example.com`, phone: '808-555-0103' }
  ]);
  console.log('Inserted 3 customers');

  await Customer.updateOne({ lastName: 'Doe' }, { $set: { email: `john.updated.${dbType}@example.com` } });
  console.log('Updated John Doe email');

  await Customer.updateOne({ lastName: 'Smith' }, { $set: { phone: '808-999-9999' } });
  console.log('Updated Jane Smith phone');

  const byLastName = await Customer.findOne({ lastName: 'Kahananui' });
  console.log('Query by last name (Kahananui):', byLastName.firstName, byLastName.lastName);

  const byFirstName = await Customer.findOne({ firstName: 'John' });
  console.log('Query by first name (John):', byFirstName.firstName, byFirstName.email);

  // ---- HOTEL CRUD ----
  console.log('\n--- Hotel Operations ---');
  await Hotel.deleteMany({});
  await Hotel.insertMany([
    { name: 'Hana Hideaway', rating: 5, location: 'Hana, Maui', description: 'Secluded rainforest retreat' },
    { name: 'Kaanapali Lodge', rating: 4, location: 'Kaanapali, Maui', description: 'Beachside Hawaiian hospitality' },
    { name: 'Wailea Cottage', rating: 5, location: 'Wailea, Maui', description: 'Romantic ocean view cottage' }
  ]);
  console.log('Inserted 3 hotels');

  const hotelByName = await Hotel.findOne({ name: 'Hana Hideaway' });
  console.log('Query hotel by name:', hotelByName.name, '| Location:', hotelByName.location);

  // ---- AMENITIES CRUD ----
  console.log('\n--- Amenities Operations ---');
  await Amenities.deleteMany({});
  await Amenities.insertMany([
    { pool: true, lawn: true, BBQ: true, laundry: false },
    { pool: false, lawn: true, BBQ: true, laundry: true },
    { pool: true, lawn: false, BBQ: false, laundry: true }
  ]);
  console.log('Inserted 3 amenities records');

  const withPool = await Amenities.findOne({ pool: true });
  console.log('Query amenities with pool:', withPool);

  await mongoose.connection.close();
  console.log(`\nDisconnected from ${dbType}`);
}

async function main() {
  // Run on local MongoDB
  await runCRUD(localURI, 'Local');

  // Run on Atlas
  await runCRUD(atlasURI, 'Atlas');

  console.log('\n✅ All CRUD operations completed successfully!');
}

main().catch(console.error);
