import { neon } from '@neondatabase/serverless';

export const hasNeonDatabase = () => Boolean(import.meta.env.DATABASE_URL);

export const database = () => {
  const connectionString = import.meta.env.DATABASE_URL;

  if (!connectionString) throw new Error('DATABASE_URL is not configured.');

  return neon(connectionString);
};
