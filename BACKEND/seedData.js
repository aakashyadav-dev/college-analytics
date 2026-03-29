const mongoose = require('mongoose');
const College = require('./models/College');
require('dotenv').config();

const sampleColleges = [
  {
    name: "Massachusetts Institute of Technology",
    type: "Engineering",
    location: "Cambridge, Massachusetts",
    establishedYear: 1861,
    totalStudents: 11520,
    rating: 4.8,
    courses: [
      { name: "Computer Science", duration: "4 years", seats: 300 },
      { name: "Mechanical Engineering", duration: "4 years", seats: 200 },
      { name: "Electrical Engineering", duration: "4 years", seats: 180 }
    ],
    facilities: ["Advanced Labs", "Research Centers", "Library", "Hostels", "Sports Complex"],
    contact: {
      email: "admissions@mit.edu",
      phone: "+1-617-253-1000",
      website: "https://mit.edu"
    },
    description: "World-renowned institution for technology and engineering education."
  },
  {
    name: "Harvard Medical School",
    type: "Medical",
    location: "Boston, Massachusetts",
    establishedYear: 1782,
    totalStudents: 7200,
    rating: 4.9,
    courses: [
      { name: "MD Program", duration: "4 years", seats: 165 },
      { name: "Biomedical Science", duration: "4 years", seats: 120 }
    ],
    facilities: ["Teaching Hospital", "Research Center", "Medical Library", "Simulation Labs"],
    contact: {
      email: "medadmissions@hms.harvard.edu",
      website: "https://hms.harvard.edu"
    },
    description: "One of the world's leading medical schools with cutting-edge research facilities."
  },
  {
    name: "Yale Law School",
    type: "Law",
    location: "New Haven, Connecticut",
    establishedYear: 1824,
    totalStudents: 630,
    rating: 4.7,
    courses: [
      { name: "Juris Doctor", duration: "3 years", seats: 200 },
      { name: "LLM Program", duration: "1 year", seats: 50 }
    ],
    facilities: ["Law Library", "Moot Court", "Legal Clinic", "Research Centers"],
    contact: {
      email: "law.admissions@yale.edu",
      website: "https://law.yale.edu"
    },
    description: "Prestigious law school known for its rigorous academic programs."
  },
  {
    name: "Stanford University",
    type: "Engineering",
    location: "Stanford, California",
    establishedYear: 1885,
    totalStudents: 17000,
    rating: 4.8,
    courses: [
      { name: "Computer Science", duration: "4 years", seats: 400 },
      { name: "Bioengineering", duration: "4 years", seats: 150 }
    ],
    facilities: ["Innovation Hub", "Research Parks", "Libraries", "Sports Facilities"],
    contact: {
      email: "admissions@stanford.edu",
      website: "https://stanford.edu"
    },
    description: "Leading research university in the heart of Silicon Valley."
  },
  {
    name: "Johns Hopkins Medical School",
    type: "Medical",
    location: "Baltimore, Maryland",
    establishedYear: 1893,
    totalStudents: 5500,
    rating: 4.7,
    courses: [
      { name: "Medical Doctor", duration: "4 years", seats: 120 },
      { name: "Public Health", duration: "2 years", seats: 200 }
    ],
    facilities: ["Research Hospital", "Medical Library", "Laboratories"],
    contact: {
      email: "admissions@jhmi.edu",
      website: "https://hopkinsmedicine.org"
    },
    description: "World-class medical institution pioneering medical research and education."
  },
  {
    name: "National Law School of India",
    type: "Law",
    location: "Bangalore, India",
    establishedYear: 1987,
    totalStudents: 800,
    rating: 4.6,
    courses: [
      { name: "BA LLB", duration: "5 years", seats: 120 },
      { name: "LLM", duration: "1 year", seats: 60 }
    ],
    facilities: ["Law Library", "Moot Court", "Hostels", "Sports Complex"],
    contact: {
      email: "admin@nls.ac.in",
      website: "https://nls.ac.in"
    },
    description: "Premier law school in India known for excellence in legal education."
  },
  {
    name: "IIT Bombay",
    type: "Engineering",
    location: "Mumbai, India",
    establishedYear: 1958,
    totalStudents: 12000,
    rating: 4.7,
    courses: [
      { name: "Computer Science", duration: "4 years", seats: 300 },
      { name: "Mechanical Engineering", duration: "4 years", seats: 250 }
    ],
    facilities: ["Labs", "Hostels", "Library", "Research Centers"],
    contact: {
      email: "admission@iitb.ac.in",
      website: "https://iitb.ac.in"
    },
    description: "Premier engineering institute in India with excellent academic programs."
  },
  {
    name: "AIIMS Delhi",
    type: "Medical",
    location: "New Delhi, India",
    establishedYear: 1956,
    totalStudents: 2500,
    rating: 4.8,
    courses: [
      { name: "MBBS", duration: "5.5 years", seats: 100 },
      { name: "MD Programs", duration: "3 years", seats: 150 }
    ],
    facilities: ["Super Specialty Hospital", "Research Center", "Library", "Hostels"],
    contact: {
      email: "info@aiims.edu",
      website: "https://aiims.edu"
    },
    description: "Premier medical institute of India with world-class healthcare facilities."
  },
  {
    name: "Harvard Business School",
    type: "Business",
    location: "Boston, Massachusetts",
    establishedYear: 1908,
    totalStudents: 2000,
    rating: 4.9,
    courses: [
      { name: "MBA", duration: "2 years", seats: 1000 },
      { name: "Executive Education", duration: "Varies", seats: 500 }
    ],
    facilities: ["Case Study Rooms", "Business Library", "Innovation Lab", "Career Center"],
    contact: {
      email: "admissions@hbs.edu",
      website: "https://hbs.edu"
    },
    description: "World-renowned business school offering transformative educational experiences."
  },
  {
    name: "California Institute of Arts",
    type: "Arts",
    location: "Valencia, California",
    establishedYear: 1961,
    totalStudents: 1500,
    rating: 4.5,
    courses: [
      { name: "Fine Arts", duration: "4 years", seats: 100 },
      { name: "Performing Arts", duration: "4 years", seats: 120 }
    ],
    facilities: ["Art Studios", "Performance Halls", "Gallery", "Recording Studios"],
    contact: {
      email: "admissions@calarts.edu",
      website: "https://calarts.edu"
    },
    description: "Leading institution for visual and performing arts education."
  },
  {
    name: "University of Oxford",
    type: "Science",
    location: "Oxford, England",
    establishedYear: 1897,
    totalStudents: 24515,
    rating: 4.9,
    courses: [
      { name: "Natural Sciences", duration: "4 years", seats: 300 },
      { name: "Mathematics", duration: "3 years", seats: 200 }
    ],
    facilities: ["Research Libraries", "Laboratories", "Museums", "Sports Grounds"],
    contact: {
      email: "admissions@ox.ac.uk",
      website: "https://ox.ac.uk"
    },
    description: "One of the world's oldest and most prestigious universities."
  },
  {
    name: "Indian Institute of Science",
    type: "Science",
    location: "Bangalore, India",
    establishedYear: 1909,
    totalStudents: 4000,
    rating: 4.7,
    courses: [
      { name: "Research Programs", duration: "5 years", seats: 150 },
      { name: "Masters Programs", duration: "2 years", seats: 200 }
    ],
    facilities: ["Research Centers", "Advanced Labs", "Library", "Hostels"],
    contact: {
      email: "registrar@iisc.ac.in",
      website: "https://iisc.ac.in"
    },
    description: "Premier institute for advanced scientific and technological research and education."
  }
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await College.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert sample data
    console.log('📊 Inserting sample data...');
    await College.insertMany(sampleColleges);
    console.log('✅ Sample data inserted successfully');

    // Verify data
    const collegeCount = await College.countDocuments();
    console.log(`✅ Database seeded with ${collegeCount} colleges`);

    // Show statistics
    const stats = await College.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalStudents: { $sum: '$totalStudents' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📈 Seeding Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} colleges, ${stat.totalStudents.toLocaleString()} students`);
    });

    const totalStudents = stats.reduce((sum, stat) => sum + stat.totalStudents, 0);
    console.log(`\n🎯 Total: ${collegeCount} colleges, ${totalStudents.toLocaleString()} students`);

    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    console.log('🎉 Seeding completed! You can now start the application.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.log('\n🔧 Please fix the errors and run: npm run seed');
    process.exit(1);
  }
}

seedDatabase();