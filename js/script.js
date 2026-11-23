
// ==========================================
// 1. ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
// ==========================================

let timerInterval = null;
let remainingTime = 0;

const timerInput = document.getElementById("timerInput");
const timerDisplay = document.getElementById("timerDisplay");

function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

document.getElementById("startTimer").addEventListener("click", function () {
    if (timerInterval !== null) return;

    if (remainingTime <= 0) {
        const value = Number(timerInput.value);

        if (!Number.isInteger(value) || value <= 0) {
            alert("Введите положительное целое количество секунд!");
            return;
        }

        remainingTime = value;
    }

    updateTimerDisplay();

    timerInterval = setInterval(function () {
        remainingTime--;
        updateTimerDisplay();

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Время вышло!");
        }
    }, 1000);
});

// Пауза
document.getElementById("pauseTimer").addEventListener("click", function () {
    clearInterval(timerInterval);
    timerInterval = null;
});

// Сброс
document.getElementById("resetTimer").addEventListener("click", function () {
    clearInterval(timerInterval);
    timerInterval = null;
    remainingTime = 0;
    timerInput.value = "";
    updateTimerDisplay();
});


// ==========================================
// 2. АККОРДЕОН С DRAG & DROP
// ==========================================

const accordion = document.getElementById("sortableAccordion");

// Раскрытие и закрытие пунктов
accordion.addEventListener("click", function (event) {
    const button = event.target.closest(".accordion-button");

    if (!button) return;

    const content = button.nextElementSibling;
    const isActive = content.classList.toggle("active");

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-expanded", isActive);
});

// Перетаскивание пунктов
let draggedItem = null;

const accordionItems = accordion.querySelectorAll(".accordion-item");

accordionItems.forEach(function (item) {

    item.addEventListener("dragstart", function (event) {
        draggedItem = item;
        item.classList.add("dragging");

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", "accordion-item");
    });

    item.addEventListener("dragend", function () {
        item.classList.remove("dragging");

        accordion.querySelectorAll(".accordion-item").forEach(function (element) {
            element.classList.remove("drag-over");
        });

        draggedItem = null;
    });

    item.addEventListener("dragover", function (event) {
        event.preventDefault();

        if (!draggedItem || draggedItem === item) return;

        item.classList.add("drag-over");
    });

    item.addEventListener("dragleave", function () {
        item.classList.remove("drag-over");
    });

    item.addEventListener("drop", function (event) {
        event.preventDefault();

        item.classList.remove("drag-over");

        if (!draggedItem || draggedItem === item) return;

        const rect = item.getBoundingClientRect();
        const middle = rect.top + rect.height / 2;

        if (event.clientY < middle) {
            accordion.insertBefore(draggedItem, item);
        } else {
            accordion.insertBefore(draggedItem, item.nextSibling);
        }
    });
});


// ==========================================
// 3. СЛАЙДЕР ИЗОБРАЖЕНИЙ
// ==========================================

const sliderTrack = document.getElementById("sliderTrack");
const sliderDots = document.getElementById("sliderDots");
const sliderViewport = document.querySelector(".slider-viewport");

const slides = Array.from(
    sliderTrack.querySelectorAll(".slide")
);

let currentSlide = 0;
let slidesPerView = 1;
let autoplayInterval = null;

let autoplayDirection = 1;
let autoplaySpeed = 3;
let autoplayEnabled = true;

const directionSelect = document.getElementById("sliderDirection");
const speedInput = document.getElementById("sliderSpeed");
const speedValue = document.getElementById("speedValue");
const slidesPerViewSelect = document.getElementById("slidesPerView");
const autoplayButton = document.getElementById("toggleAutoplay");

// Максимальный индекс первого отображаемого изображения
function getMaxSlide() {
    return Math.max(0, slides.length - slidesPerView);
}

// Создание точек
function createSliderDots() {
    sliderDots.innerHTML = "";

    for (let i = 0; i <= getMaxSlide(); i++) {
        const dot = document.createElement("button");

        dot.setAttribute("aria-label", "Перейти к группе " + (i + 1));

        dot.addEventListener("click", function () {
            showSlide(i);
        });

        sliderDots.appendChild(dot);
    }
}

// Перемещение слайдера
function showSlide(index) {
    currentSlide = Math.max(0, Math.min(index, getMaxSlide()));

    const slideWidth = 100 / slidesPerView;

    sliderTrack.style.transform =
        "translateX(-" + (currentSlide * slideWidth) + "%)";

    const dots = sliderDots.querySelectorAll("button");

    dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === currentSlide);
    });

    document.getElementById("prevSlide").disabled =
        currentSlide === 0;

    document.getElementById("nextSlide").disabled =
        currentSlide === getMaxSlide();
}

// Настройка размеров слайдов
function updateSliderLayout() {
    slidesPerView = Number(slidesPerViewSelect.value);

    slides.forEach(function (slide) {
        slide.style.flex = "0 0 " + (100 / slidesPerView) + "%";
    });

    currentSlide = Math.min(currentSlide, getMaxSlide());

    createSliderDots();
    showSlide(currentSlide);
}

// Переключение вперёд
document.getElementById("nextSlide").addEventListener("click", function () {
    if (currentSlide < getMaxSlide()) {
        showSlide(currentSlide + 1);
    }
});

// Переключение назад
document.getElementById("prevSlide").addEventListener("click", function () {
    if (currentSlide > 0) {
        showSlide(currentSlide - 1);
    }
});

// Направление прокрутки
directionSelect.addEventListener("change", function () {
    autoplayDirection = Number(directionSelect.value);
});

// Скорость прокрутки
speedInput.addEventListener("input", function () {
    autoplaySpeed = Number(speedInput.value);
    speedValue.textContent = autoplaySpeed;

    restartAutoplay();
});

// Количество изображений
slidesPerViewSelect.addEventListener("change", function () {
    updateSliderLayout();
});

// Автоматическая прокрутка
function startAutoplay() {
    clearInterval(autoplayInterval);

    if (!autoplayEnabled) return;

    autoplayInterval = setInterval(function () {
        let nextIndex = currentSlide + autoplayDirection;

        if (nextIndex > getMaxSlide()) {
            nextIndex = 0;
        }

        if (nextIndex < 0) {
            nextIndex = getMaxSlide();
        }

        showSlide(nextIndex);

    }, autoplaySpeed * 1000);
}

// Перезапуск автопрокрутки
function restartAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
}

// Включение и остановка
autoplayButton.addEventListener("click", function () {
    autoplayEnabled = !autoplayEnabled;

    if (autoplayEnabled) {
        autoplayButton.textContent = "Остановить прокрутку";
        startAutoplay();
    } else {
        clearInterval(autoplayInterval);
        autoplayButton.textContent = "Запустить прокрутку";
    }
});

// Адаптация при изменении размеров окна
window.addEventListener("resize", updateSliderLayout);

// Инициализация
updateSliderLayout();
startAutoplay();


// ==========================================
// 4. ВКЛАДКИ
// ==========================================

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const target = button.dataset.tab;

        tabButtons.forEach(function (item) {
            item.classList.remove("active");
        });

        tabContents.forEach(function (content) {
            content.classList.remove("active");
        });

        button.classList.add("active");

        document.getElementById(target).classList.add("active");
    });
});


// ==========================================
// 5. СПИСОК ЗАДАЧ TO-DO
// ==========================================

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Введите название задачи!");
        return;
    }

    const li = document.createElement("li");
    const span = document.createElement("span");
    const deleteButton = document.createElement("button");

    span.textContent = taskText;

    deleteButton.textContent = "Удалить";
    deleteButton.className = "delete-task";

    // Отметка выполненной задачи
    span.addEventListener("click", function () {
        li.classList.toggle("completed");
    });

    // Удаление задачи
    deleteButton.addEventListener("click", function () {
        li.remove();
    });

    li.appendChild(span);
    li.appendChild(deleteButton);

    taskList.appendChild(li);

    taskInput.value = "";
}

// Добавление кнопкой
document.getElementById("addTask").addEventListener("click", addTask);

// Добавление клавишей Enter
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});


// ==========================================
// 6. ГЕНЕРАТОР СЛУЧАЙНЫХ ЧИСЕЛ
// ==========================================

document.getElementById("generateNumber").addEventListener("click", function () {
    const min = Number(document.getElementById("minNumber").value);
    const max = Number(document.getElementById("maxNumber").value);

    const result = document.getElementById("randomResult");

    if (
        !Number.isSafeInteger(min) ||
        !Number.isSafeInteger(max) ||
        min > max
    ) {
        alert("Введите корректный диапазон целых чисел!");
        return;
    }

    const randomNumber =
        Math.floor(Math.random() * (max - min + 1)) + min;

    result.textContent = randomNumber;
});


// ==========================================
// 7. ВЫПАДАЮЩЕЕ МЕНЮ
// ==========================================

const dropdownButton = document.getElementById("dropdownButton");
const dropdownMenu = document.getElementById("dropdownMenu");
const dropdownArrow = document.getElementById("dropdownArrow");
const dropdownResult = document.getElementById("dropdownResult");

// Открытие и закрытие меню
dropdownButton.addEventListener("click", function () {
    const isOpen = dropdownMenu.classList.toggle("active");

    dropdownArrow.classList.toggle("active", isOpen);
    dropdownButton.setAttribute("aria-expanded", isOpen);
});

// Выбор пункта меню
dropdownMenu.querySelectorAll("a").forEach(function (item) {
    item.addEventListener("click", function () {
        dropdownButton.querySelector("span").textContent =
            item.textContent.trim();

        dropdownResult.textContent =
            "Выбран раздел: " + item.textContent.trim();

        dropdownMenu.classList.remove("active");
        dropdownArrow.classList.remove("active");

        dropdownButton.setAttribute("aria-expanded", "false");
    });
});

// Закрытие по клику за пределами меню
document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        dropdownMenu.classList.remove("active");
        dropdownArrow.classList.remove("active");

        dropdownButton.setAttribute("aria-expanded", "false");
    }
});

// Закрытие клавишей Escape
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        dropdownMenu.classList.remove("active");
        dropdownArrow.classList.remove("active");

        dropdownButton.setAttribute("aria-expanded", "false");
    }
});


// ==========================================
// 8. МОДАЛЬНОЕ ОКНО
// ==========================================

const modalOverlay = document.getElementById("modalOverlay");
const modalWindow = document.getElementById("modalWindow");
const modalHeader = document.getElementById("modalHeader");
const modalResizeHandle = document.querySelector(".modal-resize-handle");

const openModalButton = document.getElementById("openModal");
const closeModalButton = document.getElementById("closeModal");

// Открытие окна
openModalButton.addEventListener("click", function () {
    modalOverlay.classList.add("active");
});

// Закрытие окна
function closeModal() {
    modalOverlay.classList.remove("active");
}

closeModalButton.addEventListener("click", closeModal);

// Закрытие нажатием на затемнённый фон
modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

// Закрытие клавишей Escape
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal();
    }
});


// ------------------------------------------
// ПЕРЕТАСКИВАНИЕ МОДАЛЬНОГО ОКНА
// ------------------------------------------

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

modalHeader.addEventListener("pointerdown", function (event) {
    if (event.target.closest("#closeModal")) return;

    isDragging = true;

    const rect = modalWindow.getBoundingClientRect();

    modalWindow.style.left = rect.left + "px";
    modalWindow.style.top = rect.top + "px";
    modalWindow.style.transform = "none";

    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;

    modalHeader.setPointerCapture(event.pointerId);
});

modalHeader.addEventListener("pointermove", function (event) {
    if (!isDragging) return;

    const maxLeft = window.innerWidth - modalWindow.offsetWidth;
    const maxTop = window.innerHeight - modalWindow.offsetHeight;

    const left = Math.max(
        0,
        Math.min(event.clientX - dragOffsetX, maxLeft)
    );

    const top = Math.max(
        0,
        Math.min(event.clientY - dragOffsetY, maxTop)
    );

    modalWindow.style.left = left + "px";
    modalWindow.style.top = top + "px";
});

modalHeader.addEventListener("pointerup", function () {
    isDragging = false;
});

modalHeader.addEventListener("pointercancel", function () {
    isDragging = false;
});


// ------------------------------------------
// ИЗМЕНЕНИЕ РАЗМЕРА МОДАЛЬНОГО ОКНА
// ------------------------------------------

let isResizing = false;

let startX = 0;
let startY = 0;

let startWidth = 0;
let startHeight = 0;

modalResizeHandle.addEventListener("pointerdown", function (event) {
    isResizing = true;

    const rect = modalWindow.getBoundingClientRect();

    modalWindow.style.left = rect.left + "px";
    modalWindow.style.top = rect.top + "px";
    modalWindow.style.transform = "none";

    startX = event.clientX;
    startY = event.clientY;

    startWidth = rect.width;
    startHeight = rect.height;

    modalResizeHandle.setPointerCapture(event.pointerId);

    event.preventDefault();
});

modalResizeHandle.addEventListener("pointermove", function (event) {
    if (!isResizing) return;

    const rect = modalWindow.getBoundingClientRect();

    const maxWidth = window.innerWidth - rect.left - 12;
    const maxHeight = window.innerHeight - rect.top - 12;

    const newWidth = Math.max(
        280,
        Math.min(startWidth + event.clientX - startX, maxWidth)
    );

    const newHeight = Math.max(
        180,
        Math.min(startHeight + event.clientY - startY, maxHeight)
    );

    modalWindow.style.width = newWidth + "px";
    modalWindow.style.height = newHeight + "px";
});

modalResizeHandle.addEventListener("pointerup", function () {
    isResizing = false;
});

modalResizeHandle.addEventListener("pointercancel", function () {
    isResizing = false;
});
