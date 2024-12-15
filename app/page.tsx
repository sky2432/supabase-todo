'use client';
import { supabase } from '@/supabase/supabase';
import { useEffect, useState } from 'react';

interface Todo {
  id: number;
  name: string;
  done: boolean;
  created_at: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setTodos(data);
  };

  const toggleTodo = async (id: number, isCompleted: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ done: !isCompleted })
      .eq('id', id);

    if (error) {
      console.error(error);
      return;
    }

    // 更新後のtodosを再取得
    fetchTodos();
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const { error } = await supabase
      .from('todos')
      .insert([{ name: newTodo.trim(), done: false }]);

    if (error) {
      console.error(error);
      return;
    }

    setNewTodo('');
    fetchTodos();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>

      <form onSubmit={addTodo} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="新しいタスクを入力..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          追加
        </button>
      </form>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id, todo.done)}
            />
            <span
              style={{
                textDecoration: todo.done ? 'line-through' : 'none',
              }}
            >
              {todo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
