import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';

// The useColorScheme value is always either light or dark, but the built-in
// type suggests that it can be null. This will not happen in practice, so this
// makes it a bit easier to work with.
export default function useColorScheme(): NonNullable<ColorSchemeName> {
  const defaultColorScheme = _useColorScheme() as NonNullable<ColorSchemeName>;
  const [overrideColorScheme, setOverrideColorScheme] = useState(defaultColorScheme);

  useEffect(() => {
    console.log("hi?");
    let isMounted = true;
    AsyncStorage.getItem("@scheme").then((scheme: any) => {

      if (scheme) {
        console.log("Scheme Recieved: " + scheme + " " + isMounted);
        if (isMounted) setOverrideColorScheme(scheme as NonNullable<ColorSchemeName>);
      }
    }).catch((err) => {
      console.log("Async storage error: " + err);
    });
    return () => { isMounted = false };
  }, []);

  console.log("overridden: " + overrideColorScheme);

  return overrideColorScheme;
}
