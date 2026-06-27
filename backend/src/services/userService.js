const supabase = require('../config/db');

class UserService {
  async findUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "Rows contain no results" - which is fine if user doesn't exist
      throw error;
    }

    return data;
  }

  async createUser(name, email, passwordHash) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        { name, email, password_hash: passwordHash }
      ])
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
}

module.exports = new UserService();
