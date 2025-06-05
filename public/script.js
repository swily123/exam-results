document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Получаем IP-адрес и User-Agent пользователя через прокси
    const ipResponse = await fetch('https://exam-results.onrender.com/get-ip');  // Полный URL
    if (!ipResponse.ok) {
      throw new Error('Не удалось получить IP-адрес');
    }
    const ipData = await ipResponse.json();
    const { ip } = ipData;

    // Проверяем, есть ли пользователь в базе данных
    const userResponse = await fetch(`https://exam-results.onrender.com/results/${ip}`);  // Полный URL
    if (userResponse.ok) {
      const userData = await userResponse.json();

      // Очищаем старые данные из localStorage
      localStorage.removeItem('examData');

      // Сохраняем актуальные данные в localStorage
      localStorage.setItem('examData', JSON.stringify({
        subjects: JSON.parse(userData.subjects),
        results: JSON.parse(userData.results)
      }));

      // Перенаправляем на страницу загрузки
      window.location.href = 'loading.html';
      return;
    }

    // Если пользователя нет в базе данных, показываем форму
    console.log('Пользователь не найден в базе данных. Показываем форму.');
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Произошла ошибка. Пожалуйста, попробуйте снова.');
  }
});

document.getElementById('examForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Проверяем, что все добавленные предметы заполнены
  const subjectInputs = document.querySelectorAll('#subjectsContainer input[type="text"]');
  let allSubjectsFilled = true;

  subjectInputs.forEach(input => {
    if (!input.value.trim()) {
      allSubjectsFilled = false;
      alert('Пожалуйста, заполните или удалите все добавленные предметы.');
    }
  });

  if (!allSubjectsFilled) return;

  // Собираем данные формы
  const formData = new FormData(this);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Получаем IP-адрес и User-Agent пользователя через прокси
  try {
    const ipResponse = await fetch('https://exam-results.onrender.com/get-ip');  // Полный URL
    if (!ipResponse.ok) {
      throw new Error('Не удалось получить IP-адрес');
    }
    const ipData = await ipResponse.json();
    const { ip } = ipData;

    // Создаём новые данные для нового пользователя
    const subjects = ['Русский язык'];
    if (data.mathType) {
      subjects.push(data.mathType);
    }
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('subject') && value) {
        subjects.push(value);
      }
    }

    const results = {};
    subjects.forEach(subject => {
      if (subject === 'Математика (базовая)') {
        results[subject] = Math.floor(Math.random() * 6); // Оценка от 0 до 5
      } else {
        results[subject] = Math.floor(Math.random() * 91) + 10; // Баллы от 10 до 100
      }
    });

    // Отправляем данные на сервер
    const serverResponse = await fetch('https://exam-results.onrender.com/register',  { // Полный URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip,
        name: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || '',
        mathType: data.mathType,
        subjects,
        results
      })
    });

    if (!serverResponse.ok) {
      throw new Error('Ошибка при отправке данных на сервер');
    }

    // Сохраняем данные в localStorage
    const examData = { subjects, results };
    localStorage.setItem('examData', JSON.stringify(examData));
    console.log('Данные сохранены в localStorage:', examData);

    // Перенаправляем на страницу загрузки
    window.location.href = 'loading.html';
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Произошла ошибка. Пожалуйста, попробуйте снова.');
  }
});

// Добавление предметов
document.getElementById('addSubject').addEventListener('click', function () {
  const container = document.getElementById('subjectsContainer');
  const rows = container.querySelectorAll('.subject-row');
  if (rows.length >= 5) return;

  const newRow = document.createElement('div');
  newRow.classList.add('subject-row');

  const label = document.createElement('label');
  label.textContent = 'Предмет:';
  label.setAttribute('for', `subject${rows.length + 1}`);

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.id = `subject${rows.length + 1}`;
  newInput.name = `subject${rows.length + 1}`;
  newInput.setAttribute('list', 'subjectList');

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.textContent = 'Удалить';
  removeButton.classList.add('removeSubject');

  removeButton.addEventListener('click', function () {
    container.removeChild(newRow);
  });

  newRow.appendChild(label);
  newRow.appendChild(newInput);
  newRow.appendChild(removeButton);
  container.appendChild(newRow);
});

// Удаление первоначального предмета
document.querySelectorAll('.removeSubject').forEach(button => {
  button.addEventListener('click', function () {
    this.closest('.subject-row').remove();
  });
});