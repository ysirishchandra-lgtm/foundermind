const supabase = require('../config/db');

class MessageService {
  async listMessages(conversationId, userId, { page = 1, limit = 50 } = {}) {
    // First, verify the conversation belongs to the requesting user
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!conv) return null; // Unauthorized

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return { data, count, page, limit };
  }

  async createMessage(conversationId, userId, { role, content, token_count, model_used }) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, user_id: userId, role, content, token_count, model_used }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMessage(messageId, userId) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

module.exports = new MessageService();
