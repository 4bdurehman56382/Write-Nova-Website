import { database, hasNeonDatabase } from './neon';

export type StatsRange = 'day' | 'week' | 'month';

const rangeConfig: Record<StatsRange, { unit: 'day' | 'week' | 'month'; step: string; buckets: number; labelFormat: Intl.DateTimeFormatOptions }> = {
  day: { unit: 'day', step: '1 day', buckets: 14, labelFormat: { month: 'short', day: 'numeric' } },
  week: { unit: 'week', step: '1 week', buckets: 12, labelFormat: { month: 'short', day: 'numeric' } },
  month: { unit: 'month', step: '1 month', buckets: 12, labelFormat: { month: 'short', year: '2-digit' } },
};

export const isValidStatsRange = (value: unknown): value is StatsRange => value === 'day' || value === 'week' || value === 'month';

const formatBucket = (date: Date, range: StatsRange) => date.toLocaleDateString('en-US', rangeConfig[range].labelFormat);

export const recordVisit = async (path: string) => {
  if (!hasNeonDatabase()) return;
  try {
    await database()`insert into page_visits (path) values (${path})`;
  } catch (error) {
    console.error('Unable to record page visit.', error);
  }
};

export const recordSubmission = async (fullName: string, service: string) => {
  if (!hasNeonDatabase()) return;
  try {
    await database()`insert into form_submissions (full_name, service) values (${fullName}, ${service})`;
  } catch (error) {
    console.error('Unable to record form submission.', error);
  }
};

export const getVisitStats = async (range: StatsRange) => {
  const { unit, step, buckets } = rangeConfig[range];
  const rows = await database()`
    select d as bucket, count(v.id)::int as count
    from generate_series(date_trunc(${unit}, now()) - (${step}::interval * ${buckets - 1}), date_trunc(${unit}, now()), ${step}::interval) d
    left join page_visits v on date_trunc(${unit}, v.visited_at) = d
    group by d
    order by d
  ` as Array<{ bucket: Date; count: number }>;

  return rows.map((row) => ({ label: formatBucket(new Date(row.bucket), range), count: row.count }));
};

export const getSubmissionStats = async (range: StatsRange) => {
  const { unit, step, buckets } = rangeConfig[range];
  const rows = await database()`
    select d as bucket, count(s.id)::int as count
    from generate_series(date_trunc(${unit}, now()) - (${step}::interval * ${buckets - 1}), date_trunc(${unit}, now()), ${step}::interval) d
    left join form_submissions s on date_trunc(${unit}, s.submitted_at) = d
    group by d
    order by d
  ` as Array<{ bucket: Date; count: number }>;

  return rows.map((row) => ({ label: formatBucket(new Date(row.bucket), range), count: row.count }));
};
