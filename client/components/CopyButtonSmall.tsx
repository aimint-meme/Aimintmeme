"use client";
import React, { useState, useEffect } from 'react';
import {
  CopyIcon,CopyedIcon
} from "@/components/icons";

export const CopyButtonSmall = ({mint}) => {
  const fullText = mint;
  const displayedText = `${mint.slice(0, 3)}...${mint.slice(-4)}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 3000); // 3秒后恢复默认图标
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className={`copy-container ${copied ? 'copied' : ''}`}>
      <div className="text-box-small">{displayedText}</div>
      <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={handleCopy}>
        {copied ? <CopyedIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};