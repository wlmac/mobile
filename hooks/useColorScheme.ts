import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';

// The useColorScheme value is always either light or dark, but the built-in
// type suggests that it can be null. This will not happen in practice, so this
// makes it a bit easier to work with.
export default function useColorScheme() {
  const [scheme, setScheme] = useState(_useColorScheme() as NonNullable<ColorSchemeName>);
  const [schemeLoaded, setSchemeLoaded] = useState(false);
  const updateScheme = (newscheme: string) => {
    updateColourScheme(newscheme);
    setScheme(newscheme as NonNullable<ColorSchemeName>);
  }
  useEffect(() => {
    loadScheme().then(loaded => {
      if(loaded !== '') {
        setScheme(loaded as NonNullable<ColorSchemeName>);
        setSchemeLoaded(true);
      }
    }).catch(((err) => { console.error(err); }));
  }, []);
  return {scheme, schemeLoaded, updateScheme};
}

async function loadScheme() {
  return new Promise<string>((resolve, reject) => {
    AsyncStorage.getItem("@scheme").then((schemeFromStorage) => {
      if (schemeFromStorage) {
        resolve(schemeFromStorage);
      }
      else {
        resolve('');
      }
    }).catch((err) => {
      reject("Async storage error: " + err);
    });
  })
}

async function updateColourScheme(updatedScheme: string): Promise<void> {
  return new Promise((resolve, reject) => {
    AsyncStorage.setItem("@scheme", updatedScheme).then(() => {
      resolve();
    }).catch(() => { reject(); });
  })
}

export const ThemeContext = React.createContext<{
  scheme: NonNullable<ColorSchemeName>,
  schemeLoaded: boolean,
  updateScheme: (newscheme: string) => void
}>({
  scheme: 'dark' as NonNullable<ColorSchemeName>,
  schemeLoaded: false,
  updateScheme: () => undefined
});
