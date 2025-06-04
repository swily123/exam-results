document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/users');
    if (!response.ok) {
      throw new Error('Ошибка при получении данных');
    }
    const users = await response.json();

    if (users.length === 0) {
      alert('Нет зарегистрированных пользователей.');
      return;
    }

    const tableBody = document.querySelector('#usersTable tbody');
    tableBody.innerHTML = ''; // Очищаем таблицу

    users.forEach(user => {
      const row = document.createElement('tr');

      const ipCell = document.createElement('td');
      ipCell.textContent = user.ip;

      const nameCell = document.createElement('td');
      nameCell.textContent = user.name;

      const lastNameCell = document.createElement('td');
      lastNameCell.textContent = user.lastName;

      const mathTypeCell = document.createElement('td');
      mathTypeCell.textContent = user.mathType;

      const subjectsCell = document.createElement('td');
      subjectsCell.textContent = JSON.parse(user.subjects).join(', ');

      const resultsCell = document.createElement('td');
      resultsCell.textContent = JSON.stringify(JSON.parse(user.results));

      const actionsCell = document.createElement('td');

      // Кнопка "Удалить"
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Удалить';
      deleteButton.addEventListener('click', () => {
        fetch(`http://localhost:3000/delete-user/${user.ip}`, { method: 'DELETE' })
          .then(() => location.reload());
      });

      // Кнопка "Изменить"
      const editButton = document.createElement('button');
      editButton.textContent = 'Изменить';
      editButton.addEventListener('click', () => {
        openEditModal(user);
      });

      actionsCell.appendChild(deleteButton);
      actionsCell.appendChild(editButton);

      row.appendChild(ipCell);
      row.appendChild(nameCell);
      row.appendChild(lastNameCell);
      row.appendChild(mathTypeCell);
      row.appendChild(subjectsCell);
      row.appendChild(resultsCell);
      row.appendChild(actionsCell);

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    alert('Произошла ошибка при загрузке данных.');
  }
});

// Функция для открытия модального окна редактирования
function openEditModal(user) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = '#fff';
  modal.style.padding = '20px';
  modal.style.border = '1px solid #ccc';
  modal.style.zIndex = '1000';

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '999';

  const form = document.createElement('form');
  form.innerHTML = `
    <h3>Изменить результаты для ${user.name} ${user.lastName}</h3>
    <label for="results">Результаты:</label>
    <textarea id="results" rows="10">${JSON.stringify(JSON.parse(user.results), null, 2)}</textarea>
    <button type="submit">Сохранить</button>
    <button type="button" id="cancel">Отмена</button>
  `;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedResults = JSON.parse(form.querySelector('#results').value);

    await fetch(`http://localhost:3000/update-results/${user.ip}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: updatedResults })
    });

    modal.remove();
    overlay.remove();
    location.reload();
  });

  form.querySelector('#cancel').addEventListener('click', () => {
    modal.remove();
    overlay.remove();
  });

  modal.appendChild(form);
  document.body.appendChild(overlay);
  document.body.appendChild(modal);
}