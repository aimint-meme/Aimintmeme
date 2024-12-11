"use client";
import React, { useState } from "react";
import { create } from "zustand";

export const useCreateImg = create((set) => ({ 
  guidePage:1,
  setGuidePage(guidePage){
    set({guidePage})
  }
}))