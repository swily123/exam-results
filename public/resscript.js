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

  // Добавляем предмет "Математика"
  const mathType = results['Математика (профильная)']
    ? 'Математика (профильная)'
    : 'Математика (базовая)';
  const mathScore = results[mathType];

  const mathRow = document.createElement('tr');
  const mathSubjectCell = document.createElement('td');
  const mathScoreCell = document.createElement('td');

  mathSubjectCell.textContent = mathType;
  mathScoreCell.textContent = mathScore;

  mathRow.appendChild(mathSubjectCell);
  mathRow.appendChild(mathScoreCell);
  tableBody.appendChild(mathRow);

  // Добавляем остальные предметы
  for (const [subject, score] of Object.entries(results)) {
    if (!subject.includes('Математика')) {
      const row = document.createElement('tr');
      const subjectCell = document.createElement('td');
      const scoreCell = document.createElement('td');

      subjectCell.textContent = subject;
      scoreCell.textContent = score;

      row.appendChild(subjectCell);
      row.appendChild(scoreCell);
      tableBody.appendChild(row);
    }
  }
});