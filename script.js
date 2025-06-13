// Get DOM elements
const taskInput = document.getElementById('taskInput');
const quadrantSelect = document.getElementById('quadrantSelect');
const categorySelect = document.getElementById('categorySelect');

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
let currentFilter = 'all';

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    updateCompletedCount();
}

function updateCompletedCount() {
    const count = completedTasks.length;
    document.querySelector('.completed-count').textContent = count;
}

function toggleCompletedTasks() {
    const section = document.querySelector('.completed-tasks-section');
    section.classList.toggle('expanded');
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderCompletedTasks();
}

function renderCompletedTasks() {
    const completedList = document.querySelector('.completed-list');
    completedList.innerHTML = '';
    
    const filteredTasks = currentFilter === 'all' 
        ? completedTasks 
        : completedTasks.filter(task => task.quadrant === currentFilter);

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item completed';
        li.innerHTML = `
            <div class="task-content">
                <span>${task.text}</span>
                <span class="category-badge category-${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                <span class="quadrant-badge">Q${task.quadrant}</span>
            </div>
            <div class="task-actions">
                <button onclick="restoreTask(${task.id})" class="complete-btn" title="Restore Task">
                    <i class="fas fa-undo"></i>
                </button>
                <button onclick="deleteCompletedTask(${task.id})" class="delete-btn" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        completedList.appendChild(li);
    });
}

function restoreTask(id) {
    const task = completedTasks.find(t => t.id === id);
    if (task) {
        task.completed = false;
        tasks.push(task);
        completedTasks = completedTasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        renderCompletedTasks();
        showNotification('Task restored successfully!', 'success');
    }
}

function deleteCompletedTask(id) {
    completedTasks = completedTasks.filter(task => task.id !== id);
    saveTasks();
    renderCompletedTasks();
    showNotification('Task deleted permanently!', 'error');
}

// Function to add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    const quadrant = quadrantSelect.value;
    const category = categorySelect.value;
    
    if (taskText === '') {
        showNotification('Please enter a task', 'error');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        quadrant: quadrant,
        category: category,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    showNotification('Task added successfully!', 'success');
}

// Function to delete a task
function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    showNotification(`Task "${task.text}" deleted`, 'info');
}

// Function to toggle task completion
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            const newStatus = !task.completed;
            showNotification(`Task marked as ${newStatus ? 'completed' : 'incomplete'}`, 'success');
            return { ...task, completed: newStatus };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Function to complete a task
function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = true;
        completedTasks.push(task);
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        renderCompletedTasks();
        showNotification('Task completed!', 'success');
    }
}

// Function to show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Function to render tasks
function renderTasks() {
    const quadrants = {
        1: document.querySelector('#quadrant1 .task-list'),
        2: document.querySelector('#quadrant2 .task-list'),
        3: document.querySelector('#quadrant3 .task-list'),
        4: document.querySelector('#quadrant4 .task-list')
    };
    
    // Clear all quadrants
    Object.values(quadrants).forEach(list => list.innerHTML = '');
    
    // Sort tasks by completion status and then by ID
    tasks.sort((a, b) => {
        if (a.completed === b.completed) {
            return b.id - a.id;
        }
        return a.completed ? 1 : -1;
    });
    
    // Render tasks in their respective quadrants
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-content">
                <span>${task.text}</span>
                <span class="category-badge category-${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
            </div>
            <div class="task-actions">
                <button onclick="completeTask(${task.id})" class="complete-btn" title="Complete Task">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="deleteTask(${task.id})" class="delete-btn" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        quadrants[task.quadrant].appendChild(li);
    });
}

// Add event listener for Enter key
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Add focus styles to input
taskInput.addEventListener('focus', () => {
    taskInput.parentElement.classList.add('focused');
});

taskInput.addEventListener('blur', () => {
    taskInput.parentElement.classList.remove('focused');
});

// Initial render
renderTasks();
renderCompletedTasks();
updateCompletedCount();

// Add event listeners for filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Filter completed tasks by category
function filterCompletedTasks(category) {
    const completedList = document.querySelector('.completed-list');
    completedList.innerHTML = '';
    
    const filteredTasks = category === 'all' 
        ? completedTasks 
        : completedTasks.filter(task => task.category === category);
    
    filteredTasks.forEach(task => {
        const li = createCompletedTaskElement(task);
        completedList.appendChild(li);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    renderCompletedTasks();
    
    // Add event listeners for category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterCompletedTasks(btn.dataset.filter);
        });
    });
}); 