function mysqlTimezone(env = process.env) {
  const timezone = (env.MYSQL_TIMEZONE || 'local').trim();
  if (timezone === 'local') return { timezone, sessionTimeZone: null };
  if (timezone === 'Z') return { timezone, sessionTimeZone: '+00:00' };
  const offset = timezone.match(/^[+-](\d{2}):(\d{2})$/);
  if (!offset || Number(offset[1]) > 14 || Number(offset[2]) > 59 || (Number(offset[1]) === 14 && Number(offset[2]) !== 0)) {
    throw new Error('MYSQL_TIMEZONE must be local, Z, or a valid fixed UTC offset.');
  }
  return { timezone, sessionTimeZone: timezone };
}
module.exports = { mysqlTimezone };
