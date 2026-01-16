import supabase from '../config/supabase.js';
import logger from '../config/logger.js';
import { hashEmail } from '../utils/crypto.js';

/**
 * Check if an email appears in known data breaches
 */
export const checkBreach = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    // Hash the email for privacy-preserving lookup
    const emailHash = hashEmail(email);

    logger.info(`Breach check initiated by user ${userId} for hash: ${emailHash.substring(0, 8)}...`);

    // Query for breaches containing this email hash
    const { data: breaches, error } = await supabase
      .from('breach_records')
      .select('breach_id, breaches(name, breach_date, description, data_classes)')
      .eq('email_hash', emailHash);

    if (error) {
      logger.error(`Breach check error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to check breaches' });
    }

    // Log the check in audit trail
    await supabase.from('breach_checks').insert([
      {
        user_id: userId,
        email_hash: emailHash,
        breaches_found: breaches ? breaches.length : 0,
      },
    ]);

    const exposed = breaches && breaches.length > 0;
    const breachDetails = exposed
      ? breaches.map((b) => ({
          name: b.breaches.name,
          breach_date: b.breaches.breach_date,
          description: b.breaches.description,
          data_classes: b.breaches.data_classes,
        }))
      : [];

    logger.info(`Breach check completed: ${breaches ? breaches.length : 0} breaches found`);

    res.json({
      exposed,
      breach_count: breaches ? breaches.length : 0,
      breaches: breachDetails,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Breach check error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user's breach check history
 */
export const getCheckHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const { data: history, error } = await supabase
      .from('breach_checks')
      .select('id, email_hash, breaches_found, checked_at')
      .eq('user_id', userId)
      .order('checked_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(`Get history error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to retrieve history' });
    }

    // Mask email hashes for privacy
    const maskedHistory = history.map((h) => ({
      id: h.id,
      email_hash: h.email_hash.substring(0, 8) + '...',
      breaches_found: h.breaches_found,
      checked_at: h.checked_at,
    }));

    res.json({ history: maskedHistory });
  } catch (error) {
    logger.error(`Get history error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get statistics about breaches in the database
 */
export const getBreachStats = async (req, res) => {
  try {
    const { count: breachCount, error: breachError } = await supabase
      .from('breaches')
      .select('*', { count: 'exact', head: true });

    const { count: recordCount, error: recordError } = await supabase
      .from('breach_records')
      .select('*', { count: 'exact', head: true });

    if (breachError || recordError) {
      logger.error(`Stats error: ${breachError?.message || recordError?.message}`);
      return res.status(500).json({ error: 'Failed to retrieve statistics' });
    }

    res.json({
      total_breaches: breachCount || 0,
      total_records: recordCount || 0,
    });
  } catch (error) {
    logger.error(`Get stats error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default { checkBreach, getCheckHistory, getBreachStats };
