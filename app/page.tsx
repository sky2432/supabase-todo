import { supabase } from '@/supabase/client';
import { revalidatePath } from 'next/cache';

export default async function Home() {
  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error);
    return <div>Error loading todos</div>;
  }

  async function addTodo(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    if (!name.trim()) return;

    await supabase.from('todos').insert([{ name, completed: false }]);

    revalidatePath('/');
  }

  async function toggleTodo(formData: FormData) {
    'use server';

    const id = formData.get('id') as string;
    const completed = formData.get('completed') === 'true';

    await supabase.from('todos').update({ completed: !completed }).eq('id', id);

    revalidatePath('/');
  }

  async function deleteTodo(formData: FormData) {
    'use server';

    const id = formData.get('id') as string;

    await supabase.from('todos').delete().eq('id', id);

    revalidatePath('/');
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>

      <form action={addTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="新しいTodoを入力..."
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            追加
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="p-4 bg-white rounded shadow flex items-center justify-between gap-2"
          >
            <span className={todo.completed ? 'line-through' : ''}>
              {todo.name}
            </span>
            <div className="flex gap-2">
              <form action={toggleTodo}>
                <input type="hidden" name="id" value={todo.id} />
                <input
                  type="hidden"
                  name="completed"
                  value={todo.completed.toString()}
                />
                <button
                  type="submit"
                  className={`px-3 py-1 rounded ${
                    todo.completed
                      ? 'bg-gray-500 hover:bg-gray-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {todo.completed ? '未完了に戻す' : '完了'}
                </button>
              </form>
              <form action={deleteTodo}>
                <input type="hidden" name="id" value={todo.id} />
                <button
                  type="submit"
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  削除
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
