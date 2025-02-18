import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const isProd = process.env.NODE_ENV === 'production';
const prodLevels: Prisma.LogLevel[] = ['error'];
const devLevels: Prisma.LogLevel[] = [];
const logLevel = isProd ? prodLevels : [...prodLevels, ...devLevels];

export const prisma = new PrismaClient({
  log: logLevel,
});
