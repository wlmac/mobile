import * as React from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  Switch,
  Platform,
  Button,
  Alert,
} from "react-native";
import { Text, View } from "../components/Themed";
import Announcement from "../components/Announcement";
import Blog from "../components/Blog";
import FullAnnouncement from "../components/FullAnnouncement";
import * as WebBrowser from "expo-web-browser";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import DropDownPicker from "react-native-dropdown-picker";
import { Buffer } from "buffer";

import { ThemeContext } from "../hooks/useColorScheme";
import { GuestModeContext } from "../hooks/useGuestMode";
import config from "../config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomTabParamList } from "../types";
import { AnnouncementData, ID, UserData, apiRequest, BlogPostData } from '../api';
import { BlogPostDataHandler, UserDataHandler } from '../api/impl';
import { SessionContext } from "../util/session";

export default function NewsScreen({
  navigation,
}: {
  navigation: BottomTabNavigationProp<BottomTabParamList, "News">;
}) {
  // get color scheme
  let colorScheme = React.useContext(ThemeContext);
  const guestMode = React.useContext(GuestModeContext);
  const sessionContext = React.useContext(SessionContext);
  const loadNum = 5; // # announcements to load at a time

  const emptyOrgs: { name: string; icon: string }[] = [];
  const emptyTags: { name: string; color: string }[] = [];
  const emptyUsers: {
    username: string;
    first_name: string;
    last_name: string;
    graduating_year: string;
  }[] = [];

  // stores announcements
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [blogs, setBlogs] = useState<BlogPostData[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<AnnouncementData[]>([]);
  const [orgs, setOrgs] = useState(emptyOrgs);
  const [tags, setTags] = useState(emptyTags);
  const [users, setUsers] = useState(emptyUsers);

  const addOrgs = (id: number, name: string, icon: string) => {
    let tmp = orgs;
    tmp[id] = { name: name, icon: icon };
    setOrgs(tmp);
  };

  const addTags = (id: number, name: string, color: string) => {
    let tmp = tags;
    tmp[id] = { name: name, color: color };
    setTags(tmp);
  };

  const addUsers = (
    id: number,
    username: string,
    first_name: string,
    last_name: string,
    graduating_year: string
  ) => {
    let tmp = users;
    tmp[id] = {
      username: username,
      first_name: first_name,
      last_name: last_name,
      graduating_year: graduating_year,
    };
    setUsers(tmp);
  };

  // tracking how many announcements have been loaded
  const [nextAnnSet, setNextAnnSet] = useState(0);
  const [nextMySet, setNextMySet] = useState(0);
  const [nextBlogSet, setNextBlogSet] = useState(0);

  // loading
  const [isLoading, setLoading] = useState(true); // initial loading
  const [loadingMore, setLoadingMore] = useState(false); // loading more for lazy
  const [loadError, setLoadError] = useState(false);
  const loadingIcon = require("../assets/images/loading.gif");

  // toggle between my feed and school feed
  const [isFilter, setFilter] = useState(false);

  // toggle between scroll feed and full announcement feed
  const [fullAnnId, setAnnId] = useState("-1");
  function setFullAnnId(id: string) {
    setAnnId(id);
    fullA.current?.scrollTo({ x: 0, y: 0, animated: false });
  }

  //displayed info if nothing in feed
  const [noMyFeed, setNoMyFeed] = useState(false);

  // scrollview reset to top on switch toggle
  const allA = React.useRef<ScrollView>(null);
  const myA = React.useRef<ScrollView>(null);
  const allB = React.useRef<ScrollView>(null);
  const fullA = React.useRef<ScrollView>(null);

  const [dropdownSelection, setDropdown] = useState("All Announcements");
  const [lastdropdown, setLastDropdown] = useState("All Announcements");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isBlog, setBlog] = useState(false);

  // lazy loading check if user at bottom
  function isCloseToBottom({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any): boolean {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 5;
  }

  function changeDropdown(): void {
    if(lastdropdown == dropdownSelection) return;
    if (dropdownSelection === "All Announcements") {
      console.log("All Announcements scroll to top");
      allA.current?.scrollTo({ x: 0, y: 0, animated: false });
      setFilter(false);
    }
    if (dropdownSelection === "My Announcements") {
      console.log("My Announcements scroll to top");
      myA.current?.scrollTo({ x: 0, y: 0, animated: false });
      setFilter(true);
    }
    if (dropdownSelection === "Blog") {
      console.log("Blog scroll to top");
      allB.current?.scrollTo({ x: 0, y: 0, animated: false });
      setBlog(true);
    } else {
      setBlog(false);
    }
  }

  const onStartup = async () => {
    // club name + club icon API requests
    await AsyncStorage.getItem("@orgs").then((res: any) => {
      let jsonres = JSON.parse(res);
      if (jsonres && Array.isArray(jsonres)) {
        for (let i = 0; i < jsonres.length; i += 1) {
          if (jsonres[i] != null) {
            addOrgs(i, jsonres[i].name, jsonres[i].icon);
          }
        }
      }
    });

    await AsyncStorage.getItem("@tags").then((res: any) => {
      let jsonres = JSON.parse(res);
      if (jsonres && Array.isArray(jsonres)) {
        for (let i = 0; i < jsonres.length; i += 1) {
          if (jsonres[i] != null) {
            addTags(i, jsonres[i].name, jsonres[i].color);
          }
        }
      }
    });

    await AsyncStorage.getItem("@users").then((res: any) => {
      let jsonres = JSON.parse(res);
      if (jsonres && Array.isArray(jsonres)) {
        for (let i = 0; i < jsonres.length; i += 1) {
          if (jsonres[i] != null) {
            addUsers(
              i,
              jsonres[i].username,
              jsonres[i].first_name,
              jsonres[i].last_name,
              jsonres[i].graduating_year
            );
          }
        }
      }
    });

    await loadAnnouncements();
    if(!guestMode.guest){
      await loadMyAnnouncements();
    }
    await loadBlogs();

    if (myAnnouncements.length === 0) {
      setNoMyFeed(true);
    }
    setLoading(false);
  };

  const loadResults = async (
    endpoint: string,
    setAnnouncements: (a: typeof announcements) => any,
    setNextAnnSet: (a: typeof nextAnnSet) => any
  ) => {
    if (loadingMore) return;
    setLoadingMore(true);
    console.log("Guest mode: " + guestMode.guest)
    const res = await apiRequest(endpoint, undefined, "GET", sessionContext, guestMode.guest);
    console.log("res", res);
    let errored = false;
    if (typeof res === "object") {
      try {
        let jsonres: AnnouncementData[] = (res as any).results;
        if (jsonres && Array.isArray(jsonres)) {
          jsonres.forEach((item) => {
            // let orgId = item.organization.id; // gets the organization id
            // item.icon = orgs[orgId].icon;
            // item.name = orgs[orgId].name;
          });
          setAnnouncements(announcements.concat(jsonres));
          setNextAnnSet(nextAnnSet + loadNum);
        }
      } catch (_e) {
        errored = true;
      }
    } else {
      errored = true;
    }
    setLoadError(errored);
    setLoadingMore(false);
  };

  const loadBlogResults = async (
    endpoint: string,
    setBlogs: (a: typeof blogs) => any,
    setNextBlogSet: (a: typeof nextBlogSet) => any
  ) => {
    if (loadingMore) return;
    setLoadingMore(true);
    const res = await apiRequest(endpoint, undefined, "GET", sessionContext, true) as any; // TODO don't use apiRequest
    console.log(res);
    let errored = false;
    if (typeof res != "string") {
      try {
        let blogposts: BlogPostData[] = res.results.map((item: any) => BlogPostDataHandler.fromRawData(item));
        if (blogposts && Array.isArray(blogposts)) {
          setBlogs(blogposts);
          setNextBlogSet(nextBlogSet + loadNum);
        }
      } catch (_e) {
        console.error(_e);
        errored = true;
      }
    } else {
      errored = true;
    }
    setLoadError(errored);
    setLoadingMore(false);
  };

  const loadAnnouncements = async () =>
    loadResults(
      `announcements?limit=${loadNum}&offset=${nextAnnSet}`,
      setAnnouncements,
      setNextAnnSet
    );
  const loadMyAnnouncements = async () =>
    loadResults(
      `announcements/feed?limit=${loadNum}&offset=${nextMySet}`,
      setMyAnnouncements,
      setNextMySet
    );
  const loadBlogs = async () =>
    loadBlogResults(
      `v3/obj/blog-post?limit=${loadNum}&offset=${nextBlogSet}`,
      setBlogs,
      setNextBlogSet
    );

  // fetch data from API
  useEffect(() => {
    onStartup();
  }, []);
  return (
    <>
      {/* Loading Icon */}
      {isLoading && 
        <View style={styles.container}>
          <Image style={styles.loading} source={loadingIcon} />
        </View>
      }

      {/* After Everything is Loaded */}
      <View
        style={
          isLoading
            ? { display: "none" }
            : [
                styles.container,
                {
                  backgroundColor:
                    colorScheme.scheme === "dark" ? "#252525" : "#eaeaea"
                },
              ]
        }
      >
        { isBlog ? <>
          {/* Blog */}
          { fullAnnId === "-1" && <AnnouncementsViewer
            announcements={blogs}
            sref={allB}
            loadAnnouncements={loadBlogs}
          /> }
        </> : <>
          {fullAnnId === "-1" && dropdown()}
          {/* School Announcements */}
          { !isFilter && fullAnnId === "-1" && <AnnouncementsViewer
            announcements={announcements}
            sref={allA}
            loadAnnouncements={loadAnnouncements}
          /> }

          {/* My Feed Announcement */}
          { isFilter && fullAnnId === "-1" && <AnnouncementsViewer
            announcements={myAnnouncements}
            sref={myA}
            loadAnnouncements={loadMyAnnouncements}
          >
            <View
              style={[
                noMyFeed
                  ? { display: "flex" }
                  : {
                      display: "flex",
                      borderColor: "red",
                      backgroundColor: "red",
                    },
                {
                  backgroundColor:
                    colorScheme.scheme === "dark" ? "#252525" : "#eaeaea",
                },
              ]}
            >
              <Text style={{ paddingTop: 10, textAlign: "center" }}>
                There is nothing in your feed. Join some&nbsp;
                <Text
                  style={{ color: "rgb(51,102,187)" }}
                  onPress={() => {
                    WebBrowser.openBrowserAsync(`${config.server}/clubs`);
                  }}
                >
                  clubs
                </Text>
                &nbsp;to have their announcements show up here!
              </Text>
            </View>
            <View
              style={[
                guestMode.guest ? { display: "flex" } : { display: "none" },
                {
                  backgroundColor:
                    colorScheme.scheme === "dark" ? "#252525" : "#eaeaea",
                },
              ]}
            >
              <Text style={{ textAlign: "center" }}>
                <Text
                  style={{ color: "rgb(51,102,187)" }}
                  onPress={() => {
                    navigation.jumpTo("Settings");
                  }}
                >
                  {" "}
                  Log in{" "}
                </Text>
                to view your personal feed here!
              </Text>
            </View>
          </AnnouncementsViewer> }
        </> }

        {/* Full Announcement */}
        {fullAnnId !== "-1" && <ScrollView
          ref={fullA}
          style={styles.scrollView}
        >
          <FullAnnouncement
            ann={announcements
              .concat(myAnnouncements)
              .find((e: any) => e.id === fullAnnId)}
            backToScroll={setFullAnnId}
            isBlog={false}
          />
        </ScrollView> }

        {/* Divider */}
        <View
          style={{
            height: 3.5,
            width: "100%",
            backgroundColor:
              colorScheme.scheme === "dark" ? "#1c1c1c" : "#d4d4d4",
          }}
        />
      </View>
    </>
  );

  function dropdown() {
    return (
      <DropDownPicker
        theme={colorScheme.scheme == "dark" ? "DARK" : "LIGHT"}
        items={[
          { label: "All Announcements", value: "All Announcements" },
          { label: "My Announcements", value: "My Announcements" },
          { label: "Blog", value: "Blog" },
        ]}
        multiple={false}
        setValue={setDropdown}
        value={dropdownSelection}
        onChangeValue={(v) => {
          if(v != null && v != lastdropdown) {
            console.log(lastdropdown + " -> " + v);
            changeDropdown();
            setLastDropdown(v);
          }
        }}
        containerStyle={{
          opacity: 50,
          borderBottomColor:
            colorScheme.scheme === "dark" ? "#1c1c1c" : "#d4d4d4",
          borderBottomWidth: 3.5,
          borderRadius: 0,
          zIndex: 1,
        }}
        dropDownContainerStyle={{
          borderColor: "transparent",
          borderRadius: 0,
          borderBottomColor:
            colorScheme.scheme === "dark" ? "#1c1c1c" : "#d4d4d4",
          borderBottomWidth: 3.5,
          paddingRight: 30,
          backgroundColor:
            colorScheme.scheme === "dark" ? "#252525" : "#e6e6e6",
        }}
        tickIconContainerStyle={{
          position: "absolute",
          right: 0,
        }}
        tickIconStyle={{
          shadowColor: colorScheme.scheme === "dark" ? "#e0e0e0" : "#1c1c1c",
        }}
        textStyle={{
          fontWeight: "500",
          textAlign: "center",
          paddingLeft: 30,
          color: colorScheme.scheme === "dark" ? "#e0e0e0" : "#1c1c1c",
        }}
        style={{
          backgroundColor:
            colorScheme.scheme === "dark" ? "#1c1c1c" : "#e0e0e0",
          borderColor: "transparent",
          borderRadius: 0,
        }}
        open={dropdownOpen}
        setOpen={setDropdownOpen}
      />
    );
  }

  function AnnouncementsViewer({ announcements, sref, loadAnnouncements, children }: { announcements: any, sref: React.RefObject<ScrollView>, loadAnnouncements: () => any, children?: React.ReactNode }) {
    return (<ScrollView
      ref={sref}
      style={styles.scrollView}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) loadAnnouncements();
      }}
      scrollEventThrottle={0}
    >
      {Object.entries(announcements).map(([key, ann]) => (
        <Announcement key={key} ann={ann} fullAnn={setFullAnnId} />
      ))}
      {loadError ? (
        <View style={styles.error}>
          <Text style={styles.errorMessage}>An error occured.</Text>
          <Button
            title="Retry"
            onPress={() => {
              loadAnnouncements();
            }}
          ></Button>
        </View>
      ) : undefined}

      {children}
    </ScrollView>);
  }
}

// ----- STYLES -----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  loading: {
    width: 40,
    height: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 10,
  },
  scrollView: {
    marginHorizontal: 0,
  },
  row: {
    marginVertical: 10,
    flexDirection: "row",
  },
  switch: {
    paddingHorizontal: 8,
  },

  error: {
    backgroundColor: "transparent",
  },
  errorMessage: {
    textAlign: "center",
    marginTop: 5,
    marginBottom: 5,
  },
});
