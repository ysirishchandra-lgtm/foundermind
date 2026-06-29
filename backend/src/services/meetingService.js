const supabase = require('../config/db');

class MeetingService {
  async listMeetings(userId, { page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('meetings')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return { data, count, page, limit };
  }

  async getMeeting(meetingId, userId) {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async createMeeting(userId, fields) {
    const { data, error } = await supabase
      .from('meetings')
      .insert([{ user_id: userId, ...fields }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMeeting(meetingId, userId, fields) {
    const { data, error } = await supabase
      .from('meetings')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', meetingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMeeting(meetingId, userId) {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

module.exports = new MeetingService();
