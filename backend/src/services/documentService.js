const supabase = require('../config/db');

class DocumentService {
  async listDocuments(userId, { page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, count, page, limit };
  }

  async getDocument(docId, userId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async createDocument(userId, fields) {
    const { data, error } = await supabase
      .from('documents')
      .insert([{ user_id: userId, ...fields }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDocument(docId, userId, fields) {
    const { data, error } = await supabase
      .from('documents')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', docId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDocument(docId, userId) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

module.exports = new DocumentService();
