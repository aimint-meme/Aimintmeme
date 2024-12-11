"use client";
import React, { useState } from "react";
import { create } from "zustand";

export const useOverLayer = create((set) => ({
  guidePage: 0,
  setGuidePage(guidePage) {
    set({ guidePage })
  }
}))

export const useAiImageSelected = create((set) => ({
  selectImage: 0,
  setSelectImage(selectImage) {
    set({ selectImage })
  }
}))
export const useResolutionsData = create((set) => ({
  resolutionsData: {},
  setResolutionsData(resolutionsData) {
    set({ resolutionsData })
  }
}))
export const useProvider = create((set) => ({
  provider: null,
  setProvider(provider) {
    set({ provider })
  }
}))

export const useMarqueeList = create((set) => ({
  marqueeList: [],
  setMarqueeList(marqueeList) {
    set({ marqueeList })
  }
}))

export const useSolPrice = create((set) => ({
  solPrice: '',
  setSolPrice(solPrice) {
    set(solPrice)
  }
}))

export const Overlayer = () => {

  const { guidePage } = useOverLayer();
  
  return (
    <>
      {guidePage != 0 && <div className="fixed w-[100vw] h-[100vh] z-50"></div>}
    </>
  );
};