// components/Sidebar.jsx
import React from 'react';
import styles from './Sidebar.module.css';

// Placeholder data for past chats
const pastChats = [
  { id: 'chat1', title: 'Python Basics Evaluation' },
  { id: 'chat2', title: 'Data Structures HW Check' },
  { id: 'chat3', title: 'OOP Project Feedback' },
  { id: 'chat4', title: 'Web Scraper Debugging' },
];

function Sidebar({ isOpen, toggleSidebar }) {
  if (!isOpen) {
    return (
      <button onClick={toggleSidebar} className={styles.openButton}>
        &#9776; {/* Hamburger icon */}
      </button>
    );
  }

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <h3>Past Evaluations</h3>
        <button onClick={toggleSidebar} className={styles.closeButton}>
          &times; {/* Close icon */}
        </button>
      </div>
      <ul className={styles.chatList}>
        {pastChats.map(chat => (
          <li key={chat.id} className={styles.chatListItem}>
            <a href="#">{chat.title}</a> {/* Placeholder link */}
          </li>
        ))}
      </ul>
      <button className={styles.newChatButton}>+ New Evaluation</button>
    </div>
  );
}

export default Sidebar;
