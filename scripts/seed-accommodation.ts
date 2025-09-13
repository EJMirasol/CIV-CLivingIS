import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAccommodation() {
  console.log("🏠 Seeding accommodation data...");

  // Get the Young People Church Living event type
  const ypEventType = await prisma.eventType.findFirst({
    where: {
      name: {
        contains: "Young People Church Living",
        mode: "insensitive",
      },
    },
  });

  if (!ypEventType) {
    console.log("❌ Young People Church Living event type not found");
    return;
  }

  console.log(`✅ Found event type: ${ypEventType.name}`);

  // Check if rooms already exist for this event type
  const existingRooms = await prisma.room.count({
    where: { eventTypeId: ypEventType.id },
  });

  if (existingRooms > 0) {
    console.log(`✅ ${existingRooms} rooms already exist for ${ypEventType.name}`);
    return;
  }

  // Create sample rooms for YP Church Living
  const sampleRooms = [
    {
      name: "Room A - Brothers",
      description: "Brothers accommodation room with 4 beds",
      bedCount: 4,
      maxOccupancy: 4,
      eventTypeId: ypEventType.id,
    },
    {
      name: "Room B - Sisters",
      description: "Sisters accommodation room with 4 beds",
      bedCount: 4,
      maxOccupancy: 4,
      eventTypeId: ypEventType.id,
    },
    {
      name: "Dormitory 1 - Brothers",
      description: "Large dormitory for brothers with 8 beds",
      bedCount: 8,
      maxOccupancy: 8,
      eventTypeId: ypEventType.id,
    },
    {
      name: "Dormitory 2 - Sisters",
      description: "Large dormitory for sisters with 8 beds",
      bedCount: 8,
      maxOccupancy: 8,
      eventTypeId: ypEventType.id,
    },
    {
      name: "General Room",
      description: "General purpose accommodation room",
      bedCount: 6,
      maxOccupancy: 6,
      eventTypeId: null, // General use room
    },
  ];

  // Create the rooms
  for (const roomData of sampleRooms) {
    const room = await prisma.room.create({
      data: {
        ...roomData,
        currentOccupancy: 0,
      },
    });
    console.log(`✅ Created room: ${room.name}`);
  }

  console.log("🏠 Accommodation seeding completed!");
}

seedAccommodation()
  .catch((e) => {
    console.error("❌ Error seeding accommodation:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });