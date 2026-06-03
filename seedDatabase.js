const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/accommodation_finder');

// Define Schema directly (bypassing model file issues)
const listingSchema = new mongoose.Schema({
  title: String,
  price: Number,
  location: String,
  address: String,
  nearestUniversity: String,
  distanceFromCampus: String,
  roomType: String,
  amenities: [String],
  description: String,
  landlordName: String,
  landlordEmail: String,
  landlordPhone: String,
  photos: [String],
  isActive: Boolean,
  createdAt: Date
});

const Listing = mongoose.model('Listing', listingSchema);

// Your contact information
const CONTACT = {
  name: "Gaiva",
  email: "Whitedaniel381@gmail.com",
  phone: "0886606571",
  location: "Zomba, UNIMA, Malawi"
};


const hostels = [
  {
    title: "Chancellor College Gardens Hostel",
    price: 85000,
    location: "Chancellor College, Zomba",
    address: "Near CC Main Gate, Zomba",
    nearestUniversity: "University of Malawi (UNIMA)",
    distanceFromCampus: "300m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished"],
    description: "Beautiful hostel near Chancellor College. 24/7 security, clean water, and fast internet. Walking distance to all faculties.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "MZUNI Student Lodge",
    price: 65000,
    location: "Luwinga, Mzuzu",
    address: "Area 3, Luwinga, Mzuzu",
    nearestUniversity: "Mzuzu University (MZUNI)",
    distanceFromCampus: "500m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included"],
    description: "Affordable accommodation near Mzuzu University. Quiet environment perfect for studying.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "Bunda Student Residence",
    price: 80000,
    location: "Bunda, Lilongwe",
    address: "Campus View, Bunda, Lilongwe",
    nearestUniversity: "Lilongwe University of Agriculture and Natural Resources (LUANAR)",
    distanceFromCampus: "400m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished"],
    description: "Modern residence for LUANAR students. Close to agriculture labs and lecture halls.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "MUST Science Lodge",
    price: 90000,
    location: "Thyolo, Near MUST",
    address: "Hilltop Drive, Thyolo",
    nearestUniversity: "Malawi University of Science and Technology (MUST)",
    distanceFromCampus: "400m",
    roomType: "single",
    amenities: ["wifi", "utilities_included", "furnished", "security", "parking"],
    description: "Premium accommodation for MUST students. Modern facilities with mountain views.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "MUBAS Chichiri Lodge",
    price: 85000,
    location: "Chichiri, Blantyre",
    address: "Plot 45, Chichiri, Blantyre",
    nearestUniversity: "Malawi University of Business and Applied Sciences (MUBAS)",
    distanceFromCampus: "500m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished", "parking"],
    description: "Modern hostel for MUBAS students. Close to Chichiri Shopping Mall and restaurants.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "Medical Students Quarters - KUHeS",
    price: 90000,
    location: "Blantyre, Near QECH",
    address: "Queens Hospital Road, Blantyre",
    nearestUniversity: "Kamuzu University of Health Sciences (KUHeS)",
    distanceFromCampus: "200m",
    roomType: "single",
    amenities: ["wifi", "utilities_included", "furnished", "security", "water_included"],
    description: "Safe and secure hostel for medical students. Close to the teaching hospital.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "Polytechnic Student Village",
    price: 70000,
    location: "Soche, Blantyre",
    address: "Near Polytechnic Campus, Soche",
    nearestUniversity: "Malawi University of Business and Applied Sciences (MUBAS) - Polytechnic",
    distanceFromCampus: "300m",
    roomType: "shared",
    amenities: ["wifi", "water_included", "security", "furnished"],
    description: "Budget-friendly accommodation for Polytechnic students. Close to campus.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "LUANAR Natural Resources Hostel",
    price: 75000,
    location: "Lilongwe, Near NRC",
    address: "Area 24, Lilongwe",
    nearestUniversity: "Lilongwe University of Agriculture and Natural Resources (LUANAR)",
    distanceFromCampus: "600m",
    roomType: "shared",
    amenities: ["wifi", "water_included", "security"],
    description: "Convenient hostel for Natural Resources College students. Peaceful environment.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "Thyolo Student Village - MUST",
    price: 75000,
    location: "Thyolo Town",
    address: "Near MUST Main Entrance",
    nearestUniversity: "Malawi University of Science and Technology (MUST)",
    distanceFromCampus: "200m",
    roomType: "shared",
    amenities: ["wifi", "security", "water_included", "furnished"],
    description: "Affordable housing for MUST students. Walking distance to campus and town.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  },
  {
    title: "Luwinga Student Village - MZUNI",
    price: 55000,
    location: "Luwinga, Mzuzu",
    address: "Near MZUNI Main Gate",
    nearestUniversity: "Mzuzu University (MZUNI)",
    distanceFromCampus: "200m",
    roomType: "shared",
    amenities: ["wifi", "water_included", "security"],
    description: "Budget-friendly shared accommodation for MZUNI students. Just a 2-minute walk to campus.",
    landlordName: CONTACT.name,
    landlordEmail: CONTACT.email,
    landlordPhone: CONTACT.phone,
    photos: ["/images/placeholder.jpg"],
    isActive: true,
    createdAt: new Date()
  }
];

async function seedDatabase() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connection.on('connected', () => {});
    
    // Clear existing listings
    const deleted = await Listing.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing listings`);
    
    // Insert new hostels
    const inserted = await Listing.insertMany(hostels);
    console.log(`\n✅ Added ${inserted.length} hostels to database!\n`);
    
    console.log('📋 HOSTELS ADDED:');
    console.log('='.repeat(60));
    inserted.forEach((hostel, index) => {
      console.log(`${index + 1}. ${hostel.title}`);
      console.log(`   📍 ${hostel.location}`);
      console.log(`   🏫 ${hostel.nearestUniversity}`);
      console.log(`   💰 MK${hostel.price.toLocaleString()}/month`);
      console.log(`   🚶 ${hostel.distanceFromCampus} from campus\n`);
    });
    
    console.log('='.repeat(60));
    console.log('📞 YOUR CONTACT INFORMATION (on all hostels):');
    console.log(`   👤 Name: ${CONTACT.name}`);
    console.log(`   📧 Email: ${CONTACT.email}`);
    console.log(`   📱 Phone: ${CONTACT.phone}`);
    console.log(`   📍 Location: ${CONTACT.location}`);
    console.log('='.repeat(60));
    
    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
    
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();