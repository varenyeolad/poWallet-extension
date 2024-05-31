// background.js

import React from 'react';
import ReactDOM from 'react-dom';

const alarmElement = document.createElement('div');
document.body.appendChild(alarmElement);

const AlarmPage = () => {
  return (
    <div className="container">
      <div className="title">Warning: Blacklisted Domain</div>
      <div className="message">
        The domain you are trying to visit is blacklisted for security reasons. Please navigate away from this site.
      </div>
    </div>
  );
};

const showAlarmPage = () => {
  ReactDOM.render(<AlarmPage />, alarmElement);
};

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const domain = url.hostname;

    try {
      const response = await fetch('http://localhost:3001/checkDomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain })
      });
      const data = await response.json();

      if (data.message.includes('blacklisted')) {
        showAlarmPage();
        return { cancel: true };
      }
    } catch (error) {
      console.error('Error checking domain:', error);
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
