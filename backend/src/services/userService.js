const supabase = require('../config/db');

class UserService {
  async findUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  async createUser(name, email, passwordHash) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email: email.toLowerCase().trim(), password_hash: passwordHash }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async findUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateUser(id, fields) {
    // Only allow safe updatable fields
    const allowedFields = ['name', 'password_hash'];
    const sanitized = {};
    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        sanitized[key] = fields[key];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new Error('No valid fields to update.');
    }

    sanitized.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(sanitized)
      .eq('id', id)
      .select('id, name, email, created_at')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

module.exports = new UserService();
