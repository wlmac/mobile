import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';

let scheme = '';

AsyncStorage.getItem("@scheme").then((schemeFromStorage: any) => {
  if (schemeFromStorage) {
    scheme = schemeFromStorage;
  }
}).catch((err) => {
  console.log("Async storage error: " + err);
});

// The useColorScheme value is always either light or dark, but the built-in
// type suggests that it can be null. This will not happen in practice, so this
// makes it a bit easier to work with.
export default function useColorScheme(): NonNullable<ColorSchemeName> {
  const defaultColorScheme = _useColorScheme() as NonNullable<ColorSchemeName>;
  if (scheme === '') {
    return defaultColorScheme;
  }
  else {
    return scheme as NonNullable<ColorSchemeName>;
  }
}

export async function updateColourScheme(updatedScheme: string): Promise<void> {
  return new Promise((resolve, reject) => {
    scheme = updatedScheme;
    AsyncStorage.setItem("@scheme", updatedScheme).then(() => {
      resolve();
    }).catch(err => { reject(); });
  })
}
