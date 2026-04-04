import React from 'react';

const SHIFT_COLORS = [
  "#fde047", // Yellow (17:00, etc)
  "#bae6fd", // Light Blue
  "#fca5a5", // Red
  "#fbcfe8", // Pink
  "#c7d2fe", // Indigo
  "#fed7aa", // Orange
  "#d9f99d", // Lime Green
  "#e9d5ff", // Light Purple
  "#fcd34d", // Amber
];

// Helper to reliably map a shift string to a color
function getStableColor(str) {
  if (!str || str === "-" || str.trim() === "") return "transparent";
  
  // Custom deterministic rules to mimic user's picture (optional but nice touch)
  // Esercizio: '17:00' the yellow from the image, '18:00' red? No, 18:00 was yellow for others and red for Gio.
  // Better use standard hash.
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SHIFT_COLORS.length;
  return SHIFT_COLORS[index];
}

const DAYS_OF_WEEK = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export default function ScheduleTable({ 
  employees, 
  currentDate, 
  updateEmployeeName, 
  updateShift, 
  removeEmployee, 
  addEmployee 
}) {
  
  const weekDates = DAYS_OF_WEEK.map((dayName, index) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + index);
    return {
      dayName: dayName,
      dateNum: d.getDate(),
      isWeekend: index >= 5 // Sabato e Domenica
    };
  });

  return (
    <div className="board-container" id="schedule-export-target" style={{backgroundColor: '#fff', padding: '10px' }}>
      <table className="schedule-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: '#ffffff', minWidth: '150px' }}>
              <span className="day-name">Personale</span>
              <span className="day-date">Dipendente</span>
            </th>
            {weekDates.map((day, idx) => (
              <th key={idx} className={day.isWeekend ? 'weekend-header' : ''}>
                <span className="day-name">{day.dayName}</span>
                <span className="day-date">{day.dateNum}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td className="employee-cell">
                <div className="employee-cell-wrapper">
                  <button 
                    className="remove-btn" 
                    onClick={() => removeEmployee(emp.id)}
                    title="Rimuovi Dipendente"
                    data-html2canvas-ignore="true"
                  >
                    ×
                  </button>
                  <input
                    type="text"
                    className="employee-input"
                    value={emp.name}
                    placeholder="NOME"
                    onChange={(e) => updateEmployeeName(emp.id, e.target.value)}
                  />
                </div>
              </td>
              
              {weekDates.map((day, idx) => {
                const shiftVal = emp.shifts[day.dayName] || "";
                const bgColor = getStableColor(shiftVal);
                
                return (
                  <td 
                    key={idx} 
                    className={day.isWeekend ? 'weekend-cell' : ''}
                    style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : undefined }}
                  >
                    <input
                      type="text"
                      className="shift-input"
                      value={shiftVal}
                      placeholder="—"
                      onChange={(e) => updateShift(emp.id, day.dayName, e.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <button 
        className="add-employee-btn" 
        onClick={addEmployee}
        data-html2canvas-ignore="true"
      >
        + Aggiungi Dipendente
      </button>
    </div>
  );
}
