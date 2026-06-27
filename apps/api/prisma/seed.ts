import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const company = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme Logistics',
      email: 'contact@acmelogistics.com',
      phone: '+1-555-0100',
      isVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@logistics.com' },
    update: {},
    create: {
      email: 'admin@logistics.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const shipper = await prisma.user.upsert({
    where: { email: 'shipper@example.com' },
    update: {},
    create: {
      email: 'shipper@example.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Shipper',
      role: 'SHIPPER',
      isVerified: true,
    },
  });

  const fleetManager = await prisma.user.upsert({
    where: { email: 'fleet@acmelogistics.com' },
    update: {},
    create: {
      email: 'fleet@acmelogistics.com',
      passwordHash,
      firstName: 'Mike',
      lastName: 'Fleet',
      role: 'FLEET_MANAGER',
      companyId: company.id,
      isVerified: true,
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@acmelogistics.com' },
    update: {},
    create: {
      email: 'driver@acmelogistics.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Driver',
      role: 'DRIVER',
      companyId: company.id,
      isVerified: true,
    },
  });

  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      companyId: company.id,
      licenseNumber: 'DL-123456',
      isVerified: true,
      currentLat: 37.7749,
      currentLng: -122.4194,
      lastLocationAt: new Date(),
    },
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { plateNumber: 'ABC-1234' },
    update: {},
    create: {
      companyId: company.id,
      plateNumber: 'ABC-1234',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2023,
      vehicleType: 'truck',
      capacityWeight: 20000,
      capacityVolume: 80,
      status: 'AVAILABLE',
    },
  });

  console.log('Seed completed:', {
    admin: admin.email,
    shipper: shipper.email,
    fleetManager: fleetManager.email,
    driver: driverUser.email,
    company: company.name,
    vehicle: vehicle.plateNumber,
    driverId: driver.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
