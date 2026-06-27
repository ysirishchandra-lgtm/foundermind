const supabase = require('../config/db');

class TaskService {
  async listTasks(userId, { status, priority, page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count, page, limit };
  }

  async getTask(taskId, userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async createTask(userId, fields) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id: userId, ...fields }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(taskId, userId, fields) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(taskId, userId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

module.exports = new TaskService();
