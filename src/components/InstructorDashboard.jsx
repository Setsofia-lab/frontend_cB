// components/InstructorDashboard.jsx
import React, { useState } from 'react';
import styles from './InstructorDashboard.module.css';
import Sidebar from './Sidebar'; // Re-using the sidebar, might need adjustments

// Placeholder data - in a real app, this would come from a backend
const initialClasses = [
  { id: 'class101', name: 'CS101: Intro to Programming', studentCount: 25, criteria: ['critA', 'critB'] },
  { id: 'class202', name: 'CS202: Data Structures', studentCount: 30, criteria: ['critC'] },
];

const initialStudentsData = {
  class101: [
    { id: 's1', name: 'Alice Wonderland', performanceSummary: 'Good progress on functions.', evaluations: [{ assignment: 'HW1', grade: 'A', feedback: 'Excellent work' }] },
    { id: 's2', name: 'Bob The Builder', performanceSummary: 'Struggling with loops.', evaluations: [{ assignment: 'HW1', grade: 'C', feedback: 'Needs improvement on iteration' }] },
  ],
  class202: [
    { id: 's3', name: 'Charlie Brown', performanceSummary: 'Excellent understanding of linked lists.', evaluations: [] },
  ],
};

const initialCriteria = [
    { id: 'critA', name: 'Functionality', description: 'Code performs as expected.'},
    { id: 'critB', name: 'Readability', description: 'Code is easy to understand.'},
    { id: 'critC', name: 'Efficiency', description: 'Code uses resources optimally.'},
];

function InstructorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Assuming sidebar is part of this component for now
  const [activeView, setActiveView] = useState('overview');
  const [classes, setClasses] = useState(initialClasses);
  const [students, setStudents] = useState(initialStudentsData);
  const [evaluationCriteria, setEvaluationCriteria] = useState(initialCriteria);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Placeholder for actual sidebar toggle if we use the Sidebar component
  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderOverview = () => (
    <div>
      <h2>📊 Dashboard Overview</h2>
      <p>Welcome, Instructor! Here's a summary of class performances and recent activity.</p>
      {/* Placeholder for summary cards or charts */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>Total Classes: {classes.length}</div>
        <div className={styles.card}>Total Students: {Object.values(students).flat().length}</div>
        <div className={styles.card}>Criteria Defined: {evaluationCriteria.length}</div>
      </div>
    </div>
  );

  const renderManageClasses = () => (
    <div>
      <h2>📚 Manage Classes</h2>
      <button className={styles.actionButton}>[+] Add New Class</button>
      {classes.map(cls => (
        <div key={cls.id} className={styles.classItem}>
          <h3>{cls.name} (Students: {cls.studentCount})</h3>
          <button className={styles.actionButtonSmall} onClick={() => { setSelectedClassId(cls.id); setActiveView('students'); }}>View Students</button>
          <button className={styles.actionButtonSmall}>[+] Add Student to Class</button>
          <button className={styles.actionButtonSmall}>⚙️ Edit Class</button>
        </div>
      ))}
    </div>
  );

  const renderStudentPerformance = () => {
    const currentClassStudents = selectedClassId ? students[selectedClassId] : [];
    return (
      <div>
        <h2>🧑‍🎓 Student Performance {selectedClassId ? `(${classes.find(c=>c.id === selectedClassId)?.name})` : ''}</h2>
        {!selectedClassId && <p>Select a class from "Manage Classes" to view student performance.</p>}
        {selectedClassId && currentClassStudents && currentClassStudents.map(student => (
          <div key={student.id} className={styles.studentItem}>
            <h4>{student.name}</h4>
            <p>Summary: {student.performanceSummary}</p>
            <button className={styles.actionButtonSmall}>View Submitted Evaluations</button>
            <button className={styles.actionButtonSmall}>Grade Student</button>
          </div>
        ))}
        {selectedClassId && (!currentClassStudents || currentClassStudents.length === 0) && <p>No students in this class yet.</p>}
      </div>
    );
  };
  
  const renderEvaluationCriteria = () => (
    <div>
      <h2>📝 Evaluation Criteria</h2>
      <button className={styles.actionButton}>[+] Upload New Criteria</button>
      {evaluationCriteria.map(crit => (
        <div key={crit.id} className={styles.criteriaItem}>
          <h4>{crit.name}</h4>
          <p>{crit.description}</p>
          <button className={styles.actionButtonSmall}>Edit</button>
        </div>
      ))}
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview': return renderOverview();
      case 'classes': return renderManageClasses();
      case 'students': return renderStudentPerformance();
      case 'criteria': return renderEvaluationCriteria();
      default: return renderOverview();
    }
  };

  const dashboardSidebarItems = [
    { id: 'overview', title: '📊 Overview', action: () => setActiveView('overview') },
    { id: 'classes', title: '📚 Manage Classes', action: () => { setSelectedClassId(null); setActiveView('classes');} }, // Reset selected class
    { id: 'students', title: '🧑‍🎓 Student Performance', action: () => setActiveView('students') },
    { id: 'criteria', title: '📝 Evaluation Criteria', action: () => setActiveView('criteria') },
  ];

  return (
    <div className={styles.dashboardLayout}>
      <div className={styles.tempSidebarPlaceholder}>
        <h3>Instructor Menu</h3>
        <ul>
          {dashboardSidebarItems.map(item => (
            <li key={item.id} onClick={item.action} className={activeView === item.id ? styles.activeNavItem : ''}>
              {item.title}
            </li>
          ))}
        </ul>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Instructor Dashboard</h1>
          {/* Add onboarding/auth status here later */}
        </div>
        <div className={styles.contentArea}>
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;
