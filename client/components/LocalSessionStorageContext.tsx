'use client';
import React, { useRef, createContext, useContext } from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
type IState = {
  //领域专区
  wallet: {
    walletName: string | null,
    address: string | null,
    signature:string | null,
    userId:string | null,
    avatar:string | null,
  },
  isConnect:boolean | undefined,
  setState: (v: Omit<IState, 'setState'>) => void;
};

type LocalGlobalStoreApi = ReturnType<typeof createLocalGlobalStore>;

const initialState: IState = {
  wallet: {
    walletName:null,
      address: null,
      signature:null,
      userId:null,
      avatar:null,
  },
  isConnect:false,
  setState() {},
};

const createLocalGlobalStore = (initialState: IState) => {
  return createStore<IState>()(
    persist((set, get) => ({
      ...initialState,
      setState(v: any) {
        const all = get();
        if (typeof v == 'function') {
          set({ ...v(all), setState: all.setState });
        } else {
          set({ ...v, setState: all.setState });
        }
      },
    }),{
      name: 'local-global-store',
      storage: createJSONStorage(() => localStorage)
    })
  );
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
  selector: (store: Omit<IState, 'setState'>) => T
): T => {
  const localGlobalStoreContext = useContext(LocalGlobalContext);

  if (!localGlobalStoreContext) {
    throw new Error(
      `useLocalGlobalStore must be used within LocalGobalProvider`
    );
  }
  return useStore(localGlobalStoreContext, selector);
};