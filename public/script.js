document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Получаем IP-адрес и User-Agent пользователя через прокси
    const ipResponse = await fetch('https://myegeresults.onrender.com/get-ip');  // Полный URL
    if (!ipResponse.ok) {
      throw new Error('Не удалось получить IP-адрес');
    }
    const ipData = await ipResponse.json();
    const { ip, userAgent } = ipData;

    // Проверяем, есть ли пользователь в базе данных
    const userResponse = await fetch(`https://myegeresults.onrender.com/results/${ip}`);  // Полный URL
    if (userResponse.ok) {
      const userData = await userResponse.json();

      // Сохраняем данные в localStorage
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
    const ipResponse = await fetch('https://myegeresults.onrender.com/get-ip');  // Полный URL
    if (!ipResponse.ok) {
      throw new Error('Не удалось получить IP-адрес');
    }
    const ipData = await ipResponse.json();
    const { ip, userAgent } = ipData;

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
    const serverResponse = await fetch('https://myegeresults.onrender.com/register',  { // Полный URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip,
        userAgent,
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

    // Перенаправляем на страницу загрузки
    window.location.href = 'loading.html';
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Произошла ошибка. Пожалуйста, попробуйте снова.');
  }
});