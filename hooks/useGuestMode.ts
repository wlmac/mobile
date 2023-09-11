import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';

// Provides a state/setState to be used in a context
export default function useGuestMode() {
  const [guest, setGuest] = useState(false);
  const [guestLoaded, setGuestLoaded] = useState(false);
  const updateGuest = (guest: boolean) => {
    setGuestMode(guest).catch((err) => { console.error(err); });
    setGuest(guest);
  }
  useEffect(() => {
    loadGuest().then(loaded => {
      setGuest(loaded);
      setGuestLoaded(true);
    }).catch((err) => { console.error(err); });
  }, []);
  return { guest, guestLoaded, updateGuest };
}

async function loadGuest() {
  return new Promise<boolean>((resolve, reject) => {
    AsyncStorage.getItem("@guestmode").then((guest: any) => {
      if (guest) {
        resolve(guest == 'guest');
      }
      else {
        resolve(false);
      }
    }).catch((err) => {
      reject("Async storage error: " + err);
    });
  })
}

async function setGuestMode(guest: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    AsyncStorage.setItem("@guestmode", guest ? 'guest' : 'noguest').then(() => {
      resolve();
    }).catch(err => { reject(); });
  })
}

export const GuestModeContext = React.createContext({
  guest: false,
  guestLoaded: false,
  updateGuest: (val: boolean) => { }
});
