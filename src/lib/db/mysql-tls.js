/**
 * Shared by the Next.js runtime and standalone database tools.
 * Local development stays unchanged; hosted MySQL can require verified TLS.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {import('mysql2').ConnectionOptions}
 */
function mysqlTlsOptions(env = process.env) {
  const enabled = (env.MYSQL_SSL || 'false').trim().toLowerCase();
  if (enabled === 'false') return {};
  if (enabled !== 'true') throw new Error('MYSQL_SSL must be true or false.');

  const ssl = {
    rejectUnauthorized: true,
    verifyIdentity: true,
    minVersion: 'TLSv1.2',
  };
  if (env.MYSQL_SSL_CA) ssl.ca = env.MYSQL_SSL_CA.replace(/\\n/g, '\n');
  return { ssl };
}

module.exports = { mysqlTlsOptions };
