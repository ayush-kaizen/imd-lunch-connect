import { PrismaClient, Role, SlotType, BookingStatus, MatchStatus, ResponseStatus, NotificationType } from "@prisma/client";
import { addDays, setHours, setMinutes, startOfWeek, subWeeks } from "date-fns";

const prisma = new PrismaClient();

// Faculty (19 users)
const faculty = [
  {
    firstName: "David",
    lastName: "Bach",
    email: "david.bach@imd.org",
    title: "President & Professor of Strategy",
    tags: ["Strategy", "Geopolitics", "Leadership"],
    bio: "David Bach is IMD's President and a Professor of Strategy and Political Economy. He studies the intersection of business, government, and society.",
  },
  {
    firstName: "Stefan",
    lastName: "Michel",
    email: "stefan.michel@imd.org",
    title: "Dean of Faculty & Professor of Management",
    tags: ["Marketing", "Innovation", "Strategy"],
    bio: "Stefan Michel is IMD's Dean of Faculty and Research, overseeing academic programs and faculty development.",
  },
  {
    firstName: "Anand",
    lastName: "Narasimhan",
    email: "anand.narasimhan@imd.org",
    title: "Professor of Leadership & Governance",
    tags: ["Leadership", "Governance"],
    bio: "Anand Narasimhan studies corporate governance, board effectiveness, and leadership transitions.",
  },
  {
    firstName: "Jean-François",
    lastName: "Manzoni",
    email: "jean-francois.manzoni@imd.org",
    title: "Professor of Leadership & OD",
    tags: ["Leadership", "Governance", "Coaching"],
    bio: "Jean-François Manzoni is an expert in leadership, organizational behavior, and executive coaching.",
  },
  {
    firstName: "George",
    lastName: "Kohlrieser",
    email: "george.kohlrieser@imd.org",
    title: "Professor of Leadership & OB",
    tags: ["Leadership", "Negotiation", "Coaching"],
    bio: "George Kohlrieser is a clinical psychologist, hostage negotiator, and leadership expert known for his work on high-performance leadership.",
  },
  {
    firstName: "Howard",
    lastName: "Yu",
    email: "howard.yu@imd.org",
    title: "Professor of Management & Innovation",
    tags: ["Innovation", "AI & Digital", "Future Readiness"],
    bio: "Howard Yu is the LEGO Professor of Management and Innovation, focusing on how companies sustain competitive advantage.",
  },
  {
    firstName: "Mark",
    lastName: "Greeven",
    email: "mark.greeven@imd.org",
    title: "Professor of Management Innovation",
    tags: ["Innovation", "Emerging Markets", "Strategy"],
    bio: "Mark Greeven is an expert on Chinese business innovation and emerging market dynamics.",
  },
  {
    firstName: "Didier",
    lastName: "Bonnet",
    email: "didier.bonnet@imd.org",
    title: "Professor of Strategy & Digital Transformation",
    tags: ["AI & Digital", "Strategy", "Change Management"],
    bio: "Didier Bonnet helps organizations navigate digital transformation and build digital capabilities.",
  },
  {
    firstName: "Julia",
    lastName: "Binder",
    email: "julia.binder@imd.org",
    title: "Professor of Business Transformation",
    tags: ["Sustainability", "Innovation", "Leadership", "Circular Economy"],
    bio: "Julia Binder focuses on sustainable business transformation and circular economy models.",
  },
  {
    firstName: "Öykü",
    lastName: "Işık",
    email: "oyku.isik@imd.org",
    title: "Professor of Digital Strategy & Cybersecurity",
    tags: ["AI & Digital", "Cybersecurity"],
    bio: "Öykü Işık researches digital strategy, cybersecurity, and technology governance.",
  },
  {
    firstName: "Sophie",
    lastName: "Bacq",
    email: "sophie.bacq@imd.org",
    title: "Professor of Social Entrepreneurship",
    tags: ["Entrepreneurship", "Sustainability"],
    bio: "Sophie Bacq studies social entrepreneurship and how businesses create social impact.",
  },
  {
    firstName: "Richard",
    lastName: "Baldwin",
    email: "richard.baldwin@imd.org",
    title: "Professor of International Economics",
    tags: ["Economics", "Geopolitics", "Globalization"],
    bio: "Richard Baldwin is a leading trade economist studying globalization and international economics.",
  },
  {
    firstName: "Florian",
    lastName: "Hoos",
    email: "florian.hoos@imd.org",
    title: "Professor of Sustainability & Accounting",
    tags: ["Sustainability", "Finance", "Accounting"],
    bio: "Florian Hoos researches sustainable finance, ESG reporting, and corporate accountability.",
  },
  {
    firstName: "José",
    lastName: "Parra Moyano",
    email: "jose.parra-moyano@imd.org",
    title: "Professor of Digital Strategy",
    tags: ["AI & Digital", "Data & Analytics", "Entrepreneurship"],
    bio: "José Parra Moyano focuses on data economics, digital platforms, and AI strategy.",
  },
  {
    firstName: "John",
    lastName: "Weeks",
    email: "john.weeks@imd.org",
    title: "Professor of Leadership & OB",
    tags: ["Leadership", "Organizational Behavior", "Culture"],
    bio: "John Weeks studies organizational culture, leadership, and what makes organizations distinctive.",
  },
  {
    firstName: "Marleen",
    lastName: "Dieleman",
    email: "marleen.dieleman@imd.org",
    title: "Professor of Family Business",
    tags: ["Family Business", "Governance", "Emerging Markets"],
    bio: "Marleen Dieleman specializes in family business, corporate governance in Asia, and business groups.",
  },
  {
    firstName: "Ben",
    lastName: "Bryant",
    email: "ben.bryant@imd.org",
    title: "Professor of Leadership & Organization",
    tags: ["Leadership", "Change Management"],
    bio: "Ben Bryant works on leadership development, organizational change, and executive education.",
  },
  {
    firstName: "Niccolò",
    lastName: "Pisani",
    email: "niccolo.pisani@imd.org",
    title: "Professor of Strategy",
    tags: ["Strategy", "Geopolitics", "Globalization"],
    bio: "Niccolò Pisani researches international strategy, global value chains, and geopolitical risk.",
  },
  {
    firstName: "Susan",
    lastName: "Goldsworthy",
    email: "susan.goldsworthy@imd.org",
    title: "Affiliate Professor of Leadership",
    tags: ["Leadership", "Coaching", "Communication"],
    bio: "Susan Goldsworthy is an executive coach and expert in leadership communication and resilience.",
  },
];

// Staff (6 users)
const staff = [
  {
    firstName: "Ayush",
    lastName: "Bansal",
    email: "ayush.bansal@imd.org",
    title: "IT Project Manager",
    tags: ["AI & Digital", "Innovation", "Startups"],
    bio: "Ayush manages IT projects and digital initiatives at IMD, with a passion for building innovative products.",
  },
  {
    firstName: "Maria",
    lastName: "Kovacs",
    email: "maria.kovacs@imd.org",
    title: "Finance Manager",
    tags: ["Finance", "Operations"],
    bio: "Maria oversees financial operations and planning for IMD's programs.",
  },
  {
    firstName: "Thomas",
    lastName: "Leclerc",
    email: "thomas.leclerc@imd.org",
    title: "Communications Director",
    tags: ["Marketing", "Communication"],
    bio: "Thomas leads IMD's communications and brand strategy across all channels.",
  },
  {
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@imd.org",
    title: "Research Coordinator",
    tags: ["Data & Analytics", "Research"],
    bio: "Sarah coordinates research projects and supports faculty in their academic work.",
  },
  {
    firstName: "Pierre",
    lastName: "Dubois",
    email: "pierre.dubois@imd.org",
    title: "Events Manager",
    tags: ["Operations", "Hospitality"],
    bio: "Pierre manages all campus events and ensures world-class hospitality for IMD guests.",
  },
  {
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma.wilson@imd.org",
    title: "MBA Program Coordinator",
    tags: ["Leadership", "Education"],
    bio: "Emma coordinates the MBA program activities and supports student success.",
  },
];

// MBA Students (6 users)
const mbaStudents = [
  {
    firstName: "Lucas",
    lastName: "Park",
    email: "lucas.park@imd.org",
    title: "MBA Class of 2026",
    tags: ["Startups", "AI & Digital", "Fintech"],
    bio: "Former software engineer at a unicorn startup. Passionate about building products that matter.",
    pastExperience: "5 years at tech startups in Seoul and San Francisco",
  },
  {
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@imd.org",
    title: "MBA Class of 2026",
    tags: ["Sustainability", "Consulting", "Leadership"],
    bio: "Former consultant focused on sustainable business transformation.",
    pastExperience: "McKinsey & Company - Associate, Sustainability Practice",
  },
  {
    firstName: "Carlos",
    lastName: "Mendez",
    email: "carlos.mendez@imd.org",
    title: "MBA Class of 2026",
    tags: ["Entrepreneurship", "Emerging Markets", "Finance"],
    bio: "Serial entrepreneur from Mexico City with experience in fintech and e-commerce.",
    pastExperience: "Founded two startups, one acquired by Mercado Libre",
  },
  {
    firstName: "Aisha",
    lastName: "Al-Rashidi",
    email: "aisha.al-rashidi@imd.org",
    title: "MBA Class of 2026",
    tags: ["Energy", "Strategy", "Emerging Markets"],
    bio: "Strategy professional from the energy sector with experience across the Middle East.",
    pastExperience: "ADNOC - Senior Strategy Analyst",
  },
  {
    firstName: "Yuki",
    lastName: "Tanaka",
    email: "yuki.tanaka@imd.org",
    title: "MBA Class of 2026",
    tags: ["Innovation", "Supply Chain", "Operations"],
    bio: "Operations specialist with experience in manufacturing and supply chain innovation.",
    pastExperience: "Toyota - Supply Chain Manager, Japan",
  },
  {
    firstName: "Lena",
    lastName: "Müller",
    email: "lena.mueller@imd.org",
    title: "MBA Class of 2026",
    tags: ["Healthcare", "AI & Digital", "DEI"],
    bio: "Healthcare professional passionate about digital health and inclusive healthcare access.",
    pastExperience: "Roche - Digital Health Product Manager",
  },
];

function getTimeSlots(): { start: string; end: string; duration: number; type: SlotType }[] {
  return [
    { start: "11:45", end: "12:45", duration: 60, type: SlotType.LUNCH },
    { start: "12:00", end: "13:00", duration: 60, type: SlotType.LUNCH },
    { start: "12:30", end: "13:30", duration: 60, type: SlotType.LUNCH },
    { start: "15:00", end: "15:30", duration: 30, type: SlotType.COFFEE_CHAT },
    { start: "15:30", end: "16:00", duration: 30, type: SlotType.COFFEE_CHAT },
  ];
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.rouletteMatch.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.userInterestTag.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers: { id: string; role: Role; firstName: string; lastName: string }[] = [];
  const today = new Date();
  const timeSlots = getTimeSlots();

  // Create Faculty
  console.log("Creating Faculty...");
  for (const f of faculty) {
    const user = await prisma.user.create({
      data: {
        email: f.email,
        firstName: f.firstName,
        lastName: f.lastName,
        role: Role.FACULTY,
        title: f.title,
        department: "Faculty",
        bio: f.bio,
        isRouletteOptedIn: Math.random() > 0.3,
        isAvailableToday: Math.random() > 0.7,
        interests: {
          create: f.tags.map((tag) => ({ tag, isCustom: false })),
        },
      },
    });
    createdUsers.push({ id: user.id, role: Role.FACULTY, firstName: user.firstName, lastName: user.lastName });
  }

  // Create Staff
  console.log("Creating Staff...");
  for (const s of staff) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        role: Role.STAFF,
        title: s.title,
        department: "Administration",
        bio: s.bio,
        isRouletteOptedIn: Math.random() > 0.4,
        isAvailableToday: Math.random() > 0.5,
        interests: {
          create: s.tags.map((tag) => ({ tag, isCustom: false })),
        },
      },
    });
    createdUsers.push({ id: user.id, role: Role.STAFF, firstName: user.firstName, lastName: user.lastName });
  }

  // Create MBA Students
  console.log("Creating MBA Students...");
  for (const s of mbaStudents) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        role: Role.MBA_STUDENT,
        title: s.title,
        department: "MBA Program",
        bio: s.bio,
        pastExperience: s.pastExperience,
        isRouletteOptedIn: Math.random() > 0.2,
        isAvailableToday: Math.random() > 0.4,
        interests: {
          create: s.tags.map((tag) => ({ tag, isCustom: false })),
        },
      },
    });
    createdUsers.push({ id: user.id, role: Role.MBA_STUDENT, firstName: user.firstName, lastName: user.lastName });
  }

  console.log(`✅ Created ${createdUsers.length} users`);

  // Create availability slots for each user (next 2 weeks)
  console.log("Creating availability slots...");
  let slotCount = 0;

  for (const user of createdUsers) {
    const numSlots = Math.floor(Math.random() * 6) + 5; // 5-10 slots

    for (let i = 0; i < numSlots; i++) {
      const daysFromNow = Math.floor(Math.random() * 14) + 1;
      const date = addDays(today, daysFromNow);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

      try {
        await prisma.slot.create({
          data: {
            hostId: user.id,
            date: date,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            durationMinutes: timeSlot.duration,
            type: timeSlot.type,
          },
        });
        slotCount++;
      } catch {
        // Ignore duplicate slots
      }
    }
  }

  console.log(`✅ Created ${slotCount} availability slots`);

  // Create sample bookings
  console.log("Creating sample bookings...");
  const availableSlots = await prisma.slot.findMany({
    where: { isBooked: false },
    include: { host: true },
    take: 15,
  });

  let bookingCount = 0;
  for (let i = 0; i < Math.min(10, availableSlots.length); i++) {
    const slot = availableSlots[i];
    const bookerCandidates = createdUsers.filter((u) => u.id !== slot.hostId);
    const booker = bookerCandidates[Math.floor(Math.random() * bookerCandidates.length)];

    const booking = await prisma.booking.create({
      data: {
        slotId: slot.id,
        hostId: slot.hostId,
        bookerId: booker.id,
        boothNumber: (i % 5) + 1,
        bookerTalkingPoints: i % 2 === 0 ? "Looking forward to discussing career transitions and leadership." : undefined,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        host: true,
        booker: true,
        slot: true,
      },
    });

    await prisma.slot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    // Create notification for host
    await prisma.notification.create({
      data: {
        userId: slot.hostId,
        type: NotificationType.BOOKING_CONFIRMED,
        title: `Lunch confirmed with ${booker.firstName} ${booker.lastName}`,
        message: `Your lunch meeting is confirmed. You'll meet at Booth ${booking.boothNumber} in the Hub.`,
        relatedBookingId: booking.id,
      },
    });

    bookingCount++;
  }

  console.log(`✅ Created ${bookingCount} bookings`);

  // Create roulette matches
  console.log("Creating roulette matches...");
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const lastWeek = subWeeks(weekStart, 1);

  // Confirmed match from last week
  await prisma.rouletteMatch.create({
    data: {
      user1Id: createdUsers[0].id,
      user2Id: createdUsers[5].id,
      weekOf: lastWeek,
      user1Status: ResponseStatus.ACCEPTED,
      user2Status: ResponseStatus.ACCEPTED,
      status: MatchStatus.CONFIRMED,
      boothNumber: 3,
    },
  });

  // Pending match this week
  const pendingMatch = await prisma.rouletteMatch.create({
    data: {
      user1Id: createdUsers[2].id,
      user2Id: createdUsers[8].id,
      weekOf: weekStart,
      user1Status: ResponseStatus.PENDING,
      user2Status: ResponseStatus.PENDING,
      status: MatchStatus.PENDING,
    },
  });

  // Create notifications for pending match
  await prisma.notification.create({
    data: {
      userId: createdUsers[2].id,
      type: NotificationType.ROULETTE_MATCH,
      title: `Lunch Roulette: You matched with ${createdUsers[8].firstName}!`,
      message: `The wheel has spoken! Check your Lunch Roulette page to accept or decline.`,
      relatedRouletteId: pendingMatch.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: createdUsers[8].id,
      type: NotificationType.ROULETTE_MATCH,
      title: `Lunch Roulette: You matched with ${createdUsers[2].firstName}!`,
      message: `The wheel has spoken! Check your Lunch Roulette page to accept or decline.`,
      relatedRouletteId: pendingMatch.id,
    },
  });

  // Declined match from 2 weeks ago
  await prisma.rouletteMatch.create({
    data: {
      user1Id: createdUsers[10].id,
      user2Id: createdUsers[15].id,
      weekOf: subWeeks(weekStart, 2),
      user1Status: ResponseStatus.ACCEPTED,
      user2Status: ResponseStatus.DECLINED,
      status: MatchStatus.DECLINED,
    },
  });

  console.log("✅ Created 3 roulette matches");

  // Create additional sample notifications
  console.log("Creating sample notifications...");

  // Find Ayush for default user notifications
  const ayush = createdUsers.find((u) => u.firstName === "Ayush");
  if (ayush) {
    await prisma.notification.create({
      data: {
        userId: ayush.id,
        type: NotificationType.BOOKING_REMINDER,
        title: "Reminder: Lunch tomorrow with David Bach",
        message: "You have a lunch meeting tomorrow at 12:00 PM at Booth 2 in the Hub.",
        isRead: true,
      },
    });
  }

  console.log("✅ Created sample notifications");

  console.log("\n🎉 Seeding complete!");
  console.log(`   - ${createdUsers.length} users`);
  console.log(`   - ${slotCount} availability slots`);
  console.log(`   - ${bookingCount} bookings`);
  console.log(`   - 3 roulette matches`);
  console.log(`\n📌 Default login user: Ayush Bansal (ayush.bansal@imd.org)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
