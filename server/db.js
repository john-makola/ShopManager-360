
const { Pool } = require('pg');
require('dotenv').config();

// System Database (Holds Users, Organizations, Catalog)
const systemPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Cache for tenant pools
const tenantPools = new Map();

/**
 * Get or create a database connection pool for a specific tenant (organization).
 * @param {string} organizationId 
 * @returns {Promise<Pool>}
 */
const getTenantDB = async (organizationId) => {
  if (tenantPools.has(organizationId)) {
    return tenantPools.get(organizationId);
  }

  try {
    // Lookup the database connection string for the organization
    const res = await systemPool.query(
      'SELECT db_connection_string FROM organizations WHERE id = $1', 
      [organizationId]
    );

    if (res.rows.length === 0 || !res.rows[0].db_connection_string) {
      throw new Error(`No database configuration found for organization: ${organizationId}`);
    }

    const connectionString = res.rows[0].db_connection_string;
    
    // Create a new pool for this tenant
    const pool = new Pool({ connectionString });
    
    // Cache the pool
    tenantPools.set(organizationId, pool);
    
    return pool;
  } catch (err) {
    console.error('Failed to get tenant DB:', err);
    throw err;
  }
};

module.exports = {
  querySystem: (text, params) => systemPool.query(text, params),
  getTenantDB
};
