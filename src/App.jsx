import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import ScheduleTable from './components/ScheduleTable';

// Helper to get the Monday of a given date's week
function getMonday(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(dt.setDate(diff)).toISOString().split('T')[0];
}

const DEFAULT_EMPLOYEES = [
  { id: '1', name: 'MANU', shifts: {} },
  { id: '2', name: 'RISTE', shifts: {} },
  { id: '3', name: 'AURINDA', shifts: {} },
  { id: '4', name: 'JACK', shifts: {} },
  { id: '5', name: 'LORY', shifts: {} },
  { id: '6', name: "GIO'", shifts: {} },
];

export default function App() {
  const [currentWeekMonday, setCurrentWeekMonday] = useState(() => getMonday(new Date()));
  const [weeksData, setWeeksData] = useState(() => {
    const saved = localStorage.getItem('orari-app-data');
    return saved ? JSON.parse(saved) : {};
  });

  // Automatically save to local storage when the data changes
  useEffect(() => {
    localStorage.setItem('orari-app-data', JSON.stringify(weeksData));
  }, [weeksData]);

  // Derive the active employees for the current week
  const activeEmployees = weeksData[currentWeekMonday] || DEFAULT_EMPLOYEES;

  const updateWeeksData = (newEmployees) => {
    setWeeksData((prev) => ({
      ...prev,
      [currentWeekMonday]: newEmployees
    }));
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + 7);
    const nextMonday = d.toISOString().split('T')[0];
    
    // If the next week isn't defined, create it empty but carry over names
    if (!weeksData[nextMonday]) {
      const carriedOverEmployees = activeEmployees.map(emp => ({
        ...emp,
        shifts: {} // Clear shifts for new week
      }));
      setWeeksData(prev => ({
        ...prev,
        [nextMonday]: carriedOverEmployees
      }));
    }
    setCurrentWeekMonday(nextMonday);
  };

  const handlePrevWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() - 7);
    setCurrentWeekMonday(d.toISOString().split('T')[0]);
  };

  const handleCurrentWeek = () => {
    const monday = getMonday(new Date());
    setCurrentWeekMonday(monday);
  };

  const handleAddEmployee = () => {
    const newEmp = { id: Date.now().toString(), name: '', shifts: {} };
    updateWeeksData([...activeEmployees, newEmp]);
  };

  const handleRemoveEmployee = (id) => {
    updateWeeksData(activeEmployees.filter(e => e.id !== id));
  };

  const handleUpdateEmployeeName = (id, newName) => {
    updateWeeksData(activeEmployees.map(e => e.id === id ? { ...e, name: newName } : e));
  };

  const handleUpdateShift = (id, dayName, shiftString) => {
    updateWeeksData(activeEmployees.map(e => {
      if (e.id === id) {
        return {
          ...e,
          shifts: {
            ...e.shifts,
            [dayName]: shiftString
          }
        };
      }
      return e;
    }));
  };

  const handleExportJPEG = () => {
    const target = document.getElementById('schedule-export-target');
    if (!target) return;
    
    // Save original styles
    const originalStyle = {
      width: target.style.width,
      overflow: target.style.overflow,
      position: target.style.position,
    };
    
    // Force element to stretch to its full content width.
    target.style.width = 'max-content';
    target.style.overflow = 'visible';
    target.style.position = 'relative';

    html2canvas(target, {
      scale: 2, // High quality
      backgroundColor: '#ffffff',
      windowWidth: target.scrollWidth + 100 // ensure enough window width context
    }).then((canvas) => {
      // Restore styles
      target.style.width = originalStyle.width;
      target.style.overflow = originalStyle.overflow;
      target.style.position = originalStyle.position;
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement('a');
      link.download = `orari_settimana_${currentWeekMonday}.jpg`;
      link.href = dataUrl;
      link.click();
    }).catch(err => {
      target.style.width = originalStyle.width;
      target.style.overflow = originalStyle.overflow;
      target.style.position = originalStyle.position;
      console.error(err);
    });
  };

  // formatting the display title
  const startDateDisp = new Date(currentWeekMonday).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
  const d = new Date(currentWeekMonday);
  d.setDate(d.getDate() + 6); // End of week (Sunday)
  const endDateDisp = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Gestore Orari Personale</h1>
        </div>
        <div className="week-controls">
          <button className="btn btn-icon" onClick={handlePrevWeek} title="Settimana Precedente">
            ◀
          </button>
          <div className="week-display">
            {startDateDisp} - {endDateDisp}
          </div>
          <button className="btn btn-icon" onClick={handleNextWeek} title="Settimana Successiva">
            ▶
          </button>
          <button className="btn btn-outline" style={{ marginLeft: '10px' }} onClick={handleCurrentWeek}>
            Oggi
          </button>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleExportJPEG}>
            📷 Esporta JPEG
          </button>
        </div>
      </header>

      <ScheduleTable 
        employees={activeEmployees}
        currentDate={new Date(currentWeekMonday)}
        addEmployee={handleAddEmployee}
        removeEmployee={handleRemoveEmployee}
        updateEmployeeName={handleUpdateEmployeeName}
        updateShift={handleUpdateShift}
      />
    </div>
  );
}
