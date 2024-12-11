import React from 'react';

export const AlertBox = ({ showAlert, alertMessage, handleCloseAlert }) => {
  if (!showAlert) {
    return null; 
  }

  return (
    <div className="alert-box sm:w-[400px] sm:right-5 sm:bottom-5 text-left bg-[#FDEDED] text-[#14181F] border border-[#FADBDB]">
      <div className="flex flex-row justify-between">
        <h1>Failed Message</h1>
        <button onClick={handleCloseAlert} className="alert-close-btn text-[#C42525] text-[24px]">
          ×
        </button>
      </div>
      <span>{alertMessage}</span>
    </div>
  );
};