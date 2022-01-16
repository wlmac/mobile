/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
  Login: {
    loginNeeded: boolean
  };
};

export type BottomTabParamList = {
  Home: undefined;
  Notifs: undefined;
  Announcements: undefined;
  Calendar: undefined;
  Map: undefined;
  Settings: undefined;
};

export type HomeParamList = {
  HomeScreen: undefined;
};

export type AnnouncementParamList = {
  AnnouncementScreen: undefined;
};

export type CalendarParamList = {
  CalendarScreen: undefined;
}

export type MapParamList = {
  MapScreen: undefined;
}

export type SettingsParamList = {
  SettingsScreen: undefined;
}