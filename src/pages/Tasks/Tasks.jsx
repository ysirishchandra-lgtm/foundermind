import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Loader, CheckCircle2, Circle, AlertCircle, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';

export default function Tasks() {
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering / Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, todo, completed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, high, medium, low

  // Create Task Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Task State
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');

  // Delete Confirmation Dialog State
  const [taskToDelete, setTaskToDelete] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Let's build query params
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (priorityFilter !== 'all') params.push(`priority=${priorityFilter}`);
      const queryStr = params.length > 0 ? `?${params.join('&')}` : '';

      const response = await api.get(`/tasks${queryStr}`);
      // response: { success: true, data: Array, count: number }
      setTasks(response.data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Failed to load tasks from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        priority: newPriority,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : undefined
      };

      const response = await api.post('/tasks', payload);
      setTasks(prev => [response.data, ...prev]);
      toast.success('Task created successfully!');
      
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewPriority('medium');
      setNewDueDate('');
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
      
      await api.patch(`/tasks/${task.id}`, { status: nextStatus });
      toast.success(nextStatus === 'completed' ? 'Task completed!' : 'Task marked as todo');
    } catch (err) {
      // Revert status
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
      toast.error(err.message || 'Failed to update task.');
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: editTitle.trim(),
        description: editDesc.trim() || '',
        priority: editPriority,
        due_date: editDueDate ? new Date(editDueDate).toISOString() : null
      };

      const response = await api.patch(`/tasks/${editingTask.id}`, payload);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? response.data : t));
      toast.success('Task updated successfully!');
      setEditingTask(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '');
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete.id}`);
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      toast.success('Task deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete task.');
    } finally {
      setTaskToDelete(null);
    }
  };

  // Local filter for search queries
  const filteredTasks = tasks.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Coordinate your startup priorities and long-term milestones.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)} 
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', flex: '1 1 300px' }}>
          <Search size={18} className="text-secondary" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} className="text-secondary" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.85rem' }}
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Priority:</span>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.85rem' }}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="glass-card widget-card">
        <div className="widget-content">
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              <Skeleton height="50px" />
              <Skeleton height="50px" />
              <Skeleton height="50px" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={searchQuery ? 'No matching tasks' : 'Zero tasks yet'}
              description={searchQuery ? 'Modify your filters or search keywords.' : 'Add your first task to start organising your workflow.'}
              actionText={searchQuery ? null : 'Create Task'}
              onAction={searchQuery ? null : () => setIsCreateOpen(true)}
            />
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="list-item" style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.01)', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  {/* Complete/Uncomplete Checkbox */}
                  <button 
                    onClick={() => handleToggleStatus(task)}
                    style={{ color: task.status === 'completed' ? 'var(--accent-cyan)' : 'var(--text-secondary)', display: 'flex', padding: 0 }}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span 
                      className="item-title" 
                      style={{ 
                        fontSize: '0.95rem',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        color: task.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{task.description}</span>
                    )}
                    {task.due_date && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                        Due: {new Date(task.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Priority Tag */}
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.15)' : task.priority === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : 'var(--accent-blue)'
                  }}>
                    {task.priority}
                  </span>

                  {/* Edit/Delete Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => startEdit(task)}
                      style={{ color: 'var(--text-secondary)', padding: '4px' }}
                      title="Edit task"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => setTaskToDelete(task)}
                      style={{ color: '#ef4444', padding: '4px' }}
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inline Create Modal */}
      <Modal isOpen={isCreateOpen} title="Create New Task" onClose={() => setIsCreateOpen(false)}>
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Prepare Seed Pitch Deck"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              placeholder="e.g. Include user stats from Q2 metrics file"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Due Date</label>
              <input
                type="datetime-local"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsCreateOpen(false)}
              style={{ padding: '10px 20px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !newTitle.trim()}
              style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {submitting ? <Loader size={16} className="spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingTask} title="Edit Task" onClose={() => setEditingTask(null)}>
        <form onSubmit={handleEditTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Due Date</label>
              <input
                type="datetime-local"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setEditingTask(null)}
              style={{ padding: '10px 20px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !editTitle.trim()}
              style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {submitting ? <Loader size={16} className="spin" /> : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
