"use client";
import React, { useRef, createContext, useContext } from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';

type IState = {
  //领域专区
  wallet: {
    address: string | null,
    signature:string | null
  },
  isConnect:boolean,
  setState?: (v: IState) => any
};

type LocalGlobalStoreApi = ReturnType<typeof createLocalGlobalStore>;

const initialState: IState = {
    wallet: {
        address: null,
        signature:null
    },
    isConnect:false,
    setState: (v: IState) => ({}),
};

const createLocalGlobalStore = (initialState: IState) => {
  return createStore<IState>()((set, get) => ({ 
    ...initialState, 
    setState(v: any) {
      if (typeof v == 'function') {
        const all = get();
        set(v(all));
      } else {
        set(v);
      }
    } 
  }));
};

const LocalGlobalContext = createContext<LocalGlobalStoreApi | undefined>(
  undefined
);

export const LocalGobalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<LocalGlobalStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createLocalGlobalStore(initialState);
  }
  return (
    <LocalGlobalContext.Provider value={storeRef.current}>
      {children}
    </LocalGlobalContext.Provider>
  );
};

export const useLocalGlobalStore = <T,>(
    selector: (store: IState & { setState: (v: IState) => any }) => T,
  ): T => {
    const localGlobalStoreContext = useContext(LocalGlobalContext)
  
    if (!localGlobalStoreContext) {
      throw new Error(`useLocalGlobalStore must be used within LocalGobalProvider`)
    }
    return useStore(localGlobalStoreContext, selector)
  }