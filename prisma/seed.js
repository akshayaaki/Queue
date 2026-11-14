const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[QueueFlow Seed] Seeding database...');

  // Clean existing data
  await prisma.queueEvent.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.queue.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Managers (Tenants)
  const manager1 = await prisma.user.create({
    data: {
      name: 'Alex Vance',
      email: 'alex@queueflow.com',
      passwordHash,
      role: 'MANAGER',
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Chen',
      email: 'sarah@queueflow.com',
      passwordHash,
      role: 'MANAGER',
    },
  });

  console.log('[QueueFlow Seed] Created managers:', manager1.email, manager2.email);

  // 2. Create Queues for Manager 1
  const generalQueue = await prisma.queue.create({
    data: {
      name: 'General Enquiry',
      description: 'Front-desk general inquiries and visitor intake',
      queueCode: 'GEN',
      status: 'ACTIVE',
      ownerId: manager1.id,
      nextTokenNumber: 8,
      capacity: 50,
    },
  });

  const billingQueue = await prisma.queue.create({
    data: {
      name: 'Billing Department',
      description: 'Invoice verification, payment processing and claims',
      queueCode: 'BIL',
      status: 'ACTIVE',
      ownerId: manager1.id,
      nextTokenNumber: 4,
      capacity: 30,
    },
  });

  const vipQueue = await prisma.queue.create({
    data: {
      name: 'Priority Concierge',
      description: 'High-touch priority assistance for premier accounts',
      queueCode: 'VIP',
      status: 'ACTIVE',
      ownerId: manager1.id,
      nextTokenNumber: 3,
      capacity: 10,
    },
  });

  // Queues for Manager 2 (Tenant Isolation testing)
  const expressQueue = await prisma.queue.create({
    data: {
      name: 'Clinical Consultation',
      description: 'Specialist medical consultations by appointment',
      queueCode: 'MED',
      status: 'ACTIVE',
      ownerId: manager2.id,
      nextTokenNumber: 5,
      capacity: 25,
    },
  });

  console.log('[QueueFlow Seed] Created queues for Alex and Sarah');

  const now = new Date();
  const minutesAgo = (m) => new Date(now.getTime() - m * 60 * 1000);

  // 3. Create realistic tokens for General Enquiry queue
  // Token 1: Completed
  const t1 = await prisma.token.create({
    data: {
      queueId: generalQueue.id,
      tokenNumber: 'GEN-001',
      customerName: 'Rahul Sharma',
      phone: '+1 555-0192',
      email: 'rahul.s@example.com',
      notes: 'Needs international billing certificate',
      status: 'COMPLETED',
      position: 0,
      createdAt: minutesAgo(85),
      calledAt: minutesAgo(70),
      serviceStartedAt: minutesAgo(68),
      completedAt: minutesAgo(50),
    },
  });

  // Token 2: Completed
  const t2 = await prisma.token.create({
    data: {
      queueId: generalQueue.id,
      tokenNumber: 'GEN-002',
      customerName: 'Elena Rostova',
      phone: '+1 555-0144',
      email: 'elena.r@example.com',
      notes: 'Address update and account re-verification',
      status: 'COMPLETED',
      position: 0,
      createdAt: minutesAgo(65),
      calledAt: minutesAgo(48),
      serviceStartedAt: minutesAgo(47),
      completedAt: minutesAgo(32),
    },
  });

  // Token 3: Cancelled
  const t3 = await prisma.token.create({
    data: {
      queueId: generalQueue.id,
      tokenNumber: 'GEN-003',
      customerName: 'Marcus Aurelius Sterling',
      phone: '+1 555-0811',
      email: 'marcus@sterling.co',
      notes: 'Customer had urgent meeting and departed counter',
      status: 'CANCELLED',
      cancellationReason: 'Customer departed queue voluntarily',
      position: 0,
      createdAt: minutesAgo(55),
      cancelledAt: minutesAgo(40),
    },
  });

  // Token 4: Currently Serving
  const t4 = await prisma.token.create({
    data: {
      queueId: generalQueue.id,
      tokenNumber: 'GEN-004',
      customerName: 'Amina Al-Mansoor',
      phone: '+1 555-0329',
      email: 'amina.m@example.com',
      notes: 'Reviewing enterprise onboarding agreement',
      status: 'SERVING',
      position: 0,
      createdAt: minutesAgo(40),
      calledAt: minutesAgo(12),
      serviceStartedAt: minutesAgo(10),
    },
  });

  // Token 5: Waiting #1
  const t5 = await prisma.token.create({
    data: {
      queueId: generalQueue.id,
      tokenNumber: 'GEN-005',
      customerName: 'David K. O\'Connor',
      phone: '+1 555-0771',
      email: 'david.oc@example.com',
      notes: 'Passport verification document checks',
      status: 'WAITING',
      position: 1,
      createdAt: minutesAgo(28),
    },
  });

  // Token 6: Waiting #2
  const t6 = await prisma.token.create({
    data: {
      queueId: generalQueue.id,
      tokenNumber: 'GEN-006',
      customerName: 'Priya Patel',
      phone: '+1 555-0453',
      email: 'priya.patel@example.com',
      notes: 'New account card collection',
      status: 'WAITING',
      position: 2,
      createdAt: minutesAgo(18),
    },
  });

  // Token 7: Waiting #3
  const t7 = await prisma.token.create({
    data: {
      queueId: generalQueue.id,
      tokenNumber: 'GEN-007',
      customerName: 'Liam Chen-Miller',
      phone: '+1 555-0912',
      email: 'liam.cm@example.com',
      notes: 'Express dispute filing inquiry',
      status: 'WAITING',
      position: 3,
      createdAt: minutesAgo(7),
    },
  });

  // Billing Tokens
  await prisma.token.create({
    data: {
      queueId: billingQueue.id,
      tokenNumber: 'BIL-001',
      customerName: 'Sophia Loren Martinez',
      phone: '+1 555-9011',
      status: 'SERVING',
      position: 0,
      createdAt: minutesAgo(30),
      calledAt: minutesAgo(8),
      serviceStartedAt: minutesAgo(7),
    },
  });

  await prisma.token.create({
    data: {
      queueId: billingQueue.id,
      tokenNumber: 'BIL-002',
      customerName: 'Kenji Takahashi',
      phone: '+1 555-4421',
      status: 'WAITING',
      position: 1,
      createdAt: minutesAgo(15),
    },
  });

  await prisma.token.create({
    data: {
      queueId: billingQueue.id,
      tokenNumber: 'BIL-003',
      customerName: 'Chloe Dupont',
      phone: '+1 555-6612',
      status: 'WAITING',
      position: 2,
      createdAt: minutesAgo(4),
    },
  });

  // Audit Events
  const events = [
    { queueId: generalQueue.id, tokenId: t1.id, userId: manager1.id, eventType: 'TOKEN_COMPLETED', eventData: JSON.stringify({ tokenNumber: 'GEN-001' }), createdAt: minutesAgo(50) },
    { queueId: generalQueue.id, tokenId: t2.id, userId: manager1.id, eventType: 'TOKEN_COMPLETED', eventData: JSON.stringify({ tokenNumber: 'GEN-002' }), createdAt: minutesAgo(32) },
    { queueId: generalQueue.id, tokenId: t3.id, userId: manager1.id, eventType: 'TOKEN_CANCELLED', eventData: JSON.stringify({ reason: 'Customer departed queue' }), createdAt: minutesAgo(40) },
    { queueId: generalQueue.id, tokenId: t4.id, userId: manager1.id, eventType: 'SERVICE_STARTED', eventData: JSON.stringify({ tokenNumber: 'GEN-004' }), createdAt: minutesAgo(10) },
    { queueId: generalQueue.id, tokenId: t5.id, userId: manager1.id, eventType: 'TOKEN_CREATED', eventData: JSON.stringify({ tokenNumber: 'GEN-005' }), createdAt: minutesAgo(28) },
    { queueId: generalQueue.id, tokenId: t6.id, userId: manager1.id, eventType: 'TOKEN_CREATED', eventData: JSON.stringify({ tokenNumber: 'GEN-006' }), createdAt: minutesAgo(18) },
    { queueId: generalQueue.id, tokenId: t7.id, userId: manager1.id, eventType: 'TOKEN_CREATED', eventData: JSON.stringify({ tokenNumber: 'GEN-007' }), createdAt: minutesAgo(7) },
  ];

  for (const ev of events) {
    await prisma.queueEvent.create({ data: ev });
  }

  console.log('[QueueFlow Seed] Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
