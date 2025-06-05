document.addEventListener('DOMContentLoaded', () => {
  // Получаем данные из localStorage
  const examData = JSON.parse(localStorage.getItem('examData'));
  console.log('Данные загружены из localStorage:', examData);

  if (!examData || !examData.results) {
    alert('Данные не найдены. Пожалуйста, заполните форму.');
    window.location.href = 'index.html'; // Перенаправляем обратно на форму
    return;
  }

  const { subjects, results } = examData;

  // Отображение результатов в таблице
  const tableBody = document.querySelector('#resultsTable tbody');
  tableBody.innerHTML = ''; // Очищаем таблицу

  // Отображаем предметы в порядке массива subjects
  subjects.forEach(subject => {
    const row = document.createElement('tr');
    const subjectCell = document.createElement('td');
    const scoreCell = document.createElement('td');

    subjectCell.textContent = subject;
    scoreCell.textContent = results[subject] || 'Нет данных';

    row.appendChild(subjectCell);
    row.appendChild(scoreCell);
    tableBody.appendChild(row);
  });
});