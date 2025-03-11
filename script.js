// Чтение и запись задач в local storage браузера

const readFromStorage = () => JSON.parse(localStorage.getItem("tasks")) || [];
const writeToStorage = (tasks) => localStorage.setItem("tasks", JSON.stringify(tasks));

const updateStorage = (updateFunction) => {
    const tasks = readFromStorage();
    const updatedTasks = updateFunction(tasks);
    writeToStorage(updatedTasks);
};

// Проверка задач на валидность, идентификатор и статус выполнения

const isValidTask = (obj) => obj.hasOwnProperty("id") && obj.hasOwnProperty("text") && obj.hasOwnProperty("completed");
const hasId = (task, id) => isValidTask(task) && task.id === id;
const isCompleted = (task) => isValidTask(task) && task.completed === true;
const isNotCompleted = (task) => isValidTask(task) && task.completed === false;

// Получение свободного ID для новой задачи (наибольший существующий ID + 1)

const getFreeTaskId = () => {
    const tasks = readFromStorage();
    return tasks.length === 0 ?
        1 :
        tasks.map((task) => task.id)
            .reduce((max, current) => current > max ? current : max) + 1;
};

// Работа с задачами

const addTask = (tasks, id, text) => [...tasks, { id: id, text: text, completed: false }];

const setTaskCompletion = (tasks, id, completed) => tasks.map(
    (task) => hasId(task, id) ? { id: task.id, text: task.text, completed: completed } : task
);

const deleteTask = (tasks, id) => tasks.filter((task) => !hasId(task, id));

const filterTasksByStatus = (tasks, status) => {
    if (status === "completed") {
        return tasks.filter(isCompleted);
    } else if (status === "not-completed") {
        return tasks.filter(isNotCompleted);
    }
    return tasks;
};

// Получение элементов интерфейса

const taskAddInput = document.getElementById("task-add-input");
const taskAddButton = document.getElementById("task-add-button");
const filterSelect = document.getElementById("filter-select");
const taskList = document.getElementById("task-list-section");

// Обработчики событий интерфейса

taskAddButton.onclick = () => {
    updateStorage((tasks) => addTask(tasks, getFreeTaskId(), taskAddInput.value));
    taskAddInput.value = "";
    renderTasks();
};

filterSelect.onchange = () => renderTasks();

const onTaskCompletionMarkerChange = (id, checked) => {
    updateStorage((tasks) => setTaskCompletion(tasks, id, checked));
    renderTasks();
};

const onTaskDeleteButtonClick = (id) => {
    updateStorage((tasks) => deleteTask(tasks, id));
    renderTasks();
};

// Отрисовка задач на странице

const renderTasks = () => {
    taskList.innerHTML = "";

    const tasks = readFromStorage();
    const filteredTasks = filterTasksByStatus(tasks, filterSelect.value);

    filteredTasks.forEach((task) => {
        if (!isValidTask(task)) {
            return;
        }

        /*
        <div class="task">
            <input id="task-completion-marker-${task.id}" class="task-completion-marker" type="checkbox">
            <label class="task-completion-marker-label" for="task-completion-marker-${task.id}"></label>
            <span class="task-text task-text-completed">Задача 1</span>
            <button id="task-delete-button-${task.id}" type="button">
                <img src="delete.svg" alt="Удалить" width="18" height="18">
            </button>
        </div>
        */

        const taskItem = document.createElement("div");
        taskItem.className = "task";

        const taskCompletionMarker = document.createElement("input");
        taskCompletionMarker.id = `task-completion-marker-${task.id}`;
        taskCompletionMarker.className = "task-completion-marker";
        taskCompletionMarker.setAttribute("type", "checkbox");
        taskCompletionMarker.toggleAttribute("checked", task.completed === true);
        taskCompletionMarker.onchange = (e) => onTaskCompletionMarkerChange(task.id, e.currentTarget.checked);

        const taskCompletionMarkerLabel = document.createElement("label");
        taskCompletionMarkerLabel.className = "task-completion-marker-label";
        taskCompletionMarkerLabel.setAttribute("for", `task-completion-marker-${task.id}`);

        const taskText = document.createElement("span");
        taskText.classList.add("task-text");
        if (task.completed === true) {
            taskText.classList.add("task-text-completed");
        }
        taskText.innerText = task.text;

        const taskDeleteButton = document.createElement("button");
        taskDeleteButton.id = `task-delete-button-${task.id}`;
        taskDeleteButton.setAttribute("type", "button");
        taskDeleteButton.onclick = () => onTaskDeleteButtonClick(task.id);

        const taskDeleteButtonImage = document.createElement("img");
        taskDeleteButtonImage.setAttribute("src", "delete.svg");
        taskDeleteButtonImage.setAttribute("alt", "Удалить");
        taskDeleteButtonImage.setAttribute("width", "18");
        taskDeleteButtonImage.setAttribute("height", "18");

        taskDeleteButton.appendChild(taskDeleteButtonImage);

        taskItem.appendChild(taskCompletionMarker);
        taskItem.appendChild(taskCompletionMarkerLabel);
        taskItem.appendChild(taskText);
        taskItem.appendChild(taskDeleteButton);

        taskList.appendChild(taskItem);
    });
};

renderTasks();
