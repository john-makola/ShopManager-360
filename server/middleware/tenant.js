
const db = require('../db');

module.exports = async function (req, res, next) {
  // Ensure user is authenticated and has an organization_id
  if (!req.user || !req.user.organization_id) {
    return res.status(401).json({ msg: 'Tenant context missing' });
  }

  try {
    const tenantPool = await db.getTenantDB(req.user.organization_id);
    req.db = tenantPool; // Attach the specific tenant pool to the request
    next();
  } catch (err) {
    console.error('Tenant DB Resolution Error:', err.message);
    res.status(500).json({ msg: 'Database connection failed for tenant' });
  }
};
