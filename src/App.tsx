import './App.css';
import { useState } from 'react';

// Utility function to get the days in a month
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Utility function to get the first day of the month (0 = Sunday, 1 = Monday, ...)
const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const today = new Date();
  const isCurrentMonthAndYear =
    currentMonth === today.getMonth() && currentYear === today.getFullYear();

  // Generate days for the current month
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

    // Create an array of days for the calendar grid
    const daysArray = [];

    // Add empty cells for days of the previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push('');
    }

    // Add the days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }

    return daysArray;
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const todoItems = [
    'Finish React project',
    'Read a new book',
    'Exercise for 30 minutes',
    'Prepare dinner',
    'Call a friend',
  ];

  return (
    <div className='box'>
      <div className='card'>
        <div className='calendar-section'>
          <h1 className='calendar-title'>CALENDAR</h1>
          <div className='calendar-header'>
            <button onClick={handlePreviousMonth}>{'<'}</button>
            <span>
              {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
            </span>
            <button onClick={handleNextMonth}>{'>'}</button>
          </div>
          <div className='calendar-grid'>
            {daysOfWeek.map((day, index) => (
              <div key={index} className='calendar-day-header'>
                {day}
              </div>
            ))}
            {generateCalendarDays().map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${
                  isCurrentMonthAndYear && day === today.getDate() ? 'highlighted-day' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className='todo-section'>
          <ul className='todo-list'>
            {todoItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
