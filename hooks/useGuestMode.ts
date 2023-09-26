import React, { useEffect, useState } from 'react';
import { Session, SessionContext } from '../util/session';

// Provides a state/setState to be used in a context
export default function useGuestMode() {
  const session = React.useContext(SessionContext);

  const [guest, setGuest] = useState(false);
  const [guestLoaded, setGuestLoaded] = useState(false);
  const updateGuest = (guest: boolean) => {
    setGuestMode(session, guest);
    setGuest(guest);
  }
  useEffect(() => {
    setGuest(loadGuest(session));
    setGuestLoaded(true);
  }, []);
  return { guest, guestLoaded, updateGuest };
}

function loadGuest(session: Session) {
  const guest = session.get("@guestmode");
  if (guest) {
    return guest == 'guest';
  } else {
    return false;
  }
}

function setGuestMode(session: Session, guest: boolean): void {
  session.set("@guestmode", guest ? 'guest' : 'noguest');
}

export const GuestModeContext = React.createContext<{
  guest: boolean,
  guestLoaded: boolean,
  updateGuest: (guest: boolean) => void
}>({
  guest: false,
  guestLoaded: false,
  updateGuest: () => undefined
});
