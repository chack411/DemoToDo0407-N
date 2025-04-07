document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');

    // Create filter controls
    const filterContainer = document.createElement('div');
    filterContainer.style.marginBottom = '20px';
    const filterLabel = document.createElement('label');
    filterLabel.textContent = 'フィルター: ';
    const filterSelect = document.createElement('select');
    ['すべて', '未着手', '進行', '完了'].forEach(filter => {
        const option = document.createElement('option');
        option.value = filter;
        option.textContent = filter;
        filterSelect.appendChild(option);
    });
    filterContainer.appendChild(filterLabel);
    filterContainer.appendChild(filterSelect);
    document.body.insertBefore(filterContainer, taskList);

    // Filter tasks
    const filterTasks = () => {
        const filterValue = filterSelect.value;
        document.querySelectorAll('.task').forEach(task => {
            const status = task.querySelector('select').value;
            if (filterValue === 'すべて' || filterValue === status) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        });
    };

    filterSelect.addEventListener('change', filterTasks);

    // Sort tasks by deadline
    const sortTasksByDeadline = () => {
        const tasks = Array.from(document.querySelectorAll('.task'));
        tasks.sort((a, b) => {
            const deadlineA = new Date(a.querySelector('span').textContent.split(' (Due: ')[1].slice(0, -1));
            const deadlineB = new Date(b.querySelector('span').textContent.split(' (Due: ')[1].slice(0, -1));
            return deadlineA - deadlineB;
        });
        tasks.forEach(task => taskList.appendChild(task));
    };

    // Add sort button
    const sortButton = document.createElement('button');
    sortButton.textContent = '締め切り順にソート';
    sortButton.style.marginBottom = '20px';
    sortButton.addEventListener('click', sortTasksByDeadline);
    document.body.insertBefore(sortButton, taskList);

    // Load tasks from local storage
    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(({ title, deadline, status }) => {
            addTaskToDOM(title, deadline, status);
        });
    };

    // Save tasks to local storage
    const saveTasksWithoutSorting = () => {
        const tasks = [];
        document.querySelectorAll('.task').forEach(task => {
            const title = task.querySelector('span').textContent.split(' (Due: ')[0];
            const deadline = task.querySelector('span').textContent.split(' (Due: ')[1].slice(0, -1);
            const status = task.querySelector('select').value;
            tasks.push({ title, deadline, status });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const saveTasks = () => {
        saveTasksWithoutSorting();
        sortTasksByDeadline();
    };

    // Add task to DOM
    const addTaskToDOM = (title, deadline, status = '未着手') => {
        const task = document.createElement('div');
        task.className = 'task';

        const taskTitle = document.createElement('span');
        taskTitle.textContent = `${title} (Due: ${deadline})`;

        const statusSelect = document.createElement('select');
        ['未着手', '進行', '完了'].forEach(s => {
            const option = document.createElement('option');
            option.value = s;
            option.textContent = s;
            if (s === status) option.selected = true;
            statusSelect.appendChild(option);
        });
        statusSelect.addEventListener('change', () => {
            saveTasks();
            filterTasks();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.style.marginLeft = '10px';
        deleteButton.addEventListener('click', () => {
            taskList.removeChild(task);
            saveTasks();
        });

        task.appendChild(taskTitle);
        task.appendChild(statusSelect);
        task.appendChild(deleteButton);
        taskList.appendChild(task);
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value;
        const deadline = document.getElementById('taskDeadline').value;

        addTaskToDOM(title, deadline);
        saveTasks();
        filterTasks();

        taskForm.reset();
    });

    loadTasks();
    filterTasks();
});