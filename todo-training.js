import {
  createApp,
  ref,
  computed,
  onMounted,
  watch,
} from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.5.4/vue.esm-browser.min.js';

const STORAGE_KEY = 'todos-vuejs-2.0';
const todoStorage = {
  fetch() {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    todos.forEach(function (todo, index) {
      todo.id = index;
    });
    todoStorage.uid = todos.length;
    return todos;
  },
  save(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
  uid: 0
};

// visibility filters
const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter((todo) => !todo.completed),
  completed: (todos) => todos.filter((todo) => todo.completed),
};

// app Vue instance
const app = createApp({
  setup() {
    const todos = ref([]);
    const visibility = ref('all');
    const filteredTodos = computed(() => filters[visibility.value](todos.value));
    const remaining = computed(() => filters.active(todos.value).length);
    const pluralize = (n) => (n === 1 ? 'item' : 'items');

    const newTodo = ref('');
    const addTodo = () => {
      const text = newTodo.value.trim();
      if (!text) return;
      todos.value.push({
          id: todoStorage.uid++,
          title: text,
          completed: false,
      });
      newTodo.value = '';
    };

    const removeTodo = (todo) => {
      todos.value = todos.value.filter((t) => t.id !== todo.id);
    };

    const editedTodo = ref('');

    let beforeEditCache = null;

    const editTodo = (todo) => {
      beforeEditCache = todo.title;
      editedTodo.value = todo;
    };

    const doneEdit = (todo) => {
      if (!editedTodo.value) return;
      editedTodo.value = '';
      todo.title = todo.title.trim();
      if (!todo.title) removeTodo(todo);
    };

    const cancelEdit = (todo) => {
      todo.title = beforeEditCache;
      editedTodo.value = '';
    };

    const removeCompleted = () => {
      todos.value = filters.active(todos.value);
    };

    const allDone = computed({
      get: () => remaining.value === 0,
      set: (value) => {
        todos.value.forEach((todo) => {
          todo.completed = value;
        });
      }
    });

    onMounted(() => {
      todos.value = todoStorage.fetch();
    });

    watch(todos, (todos) => {
      todoStorage.save(todos);
    }, {deep: true});

    return {
      todos,
      visibility,
      filteredTodos,
      remaining,
      pluralize,
      newTodo,
      addTodo,
      removeTodo,
      editedTodo,
      editTodo,
      doneEdit,
      cancelEdit,
      removeCompleted,
      allDone,
    }
  },

  directives: {
    'todo-focus': {
      updated(el, binding) {
        if (binding.value) {
          el.focus();
        }
      },
    },
  },
});

// mount
app.mount('.todoapp');
