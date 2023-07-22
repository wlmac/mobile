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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Text, View } from "../components/Themed";
import Announcement from "../components/Announcement";
import FullAnnouncement from "../components/FullAnnouncement";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import DropDownPicker from "react-native-dropdown-picker";
import * as WebBrowser from "expo-web-browser";
import { ThemeContext } from "../hooks/useColorScheme";
import { GuestModeContext } from "../hooks/useGuestMode";
import { BottomTabParamList } from "../types";
import { AnnouncementData, ID, UserData, apiRequest, BlogPostData, URLString, TagDescriptor } from '../api';
import { AnnouncementDataHandler, BlogPostDataHandler, OrganizationDataHandler, TagDataHandler, UserDataHandler } from '../api/impl';
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
    graduating_year: number;
  }[] = [];

  // stores announcements
  const [allAnnouncementsData, setAllAnnouncementsData] = useState<AnnouncementProps[]>([]);
  const [myAnnouncementsData, setMyAnnouncementsData] = useState<AnnouncementProps[]>([]);
  const [blogData, setBlogData] = useState<AnnouncementProps[]>([]);
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
    graduating_year: number
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

  // api iterators

  const [announcementsIterator, setAnnouncementsIterator] = useState<AsyncIterableIterator<AnnouncementData>>();
  const [blogsIterator, setBlogsIterator] = useState<AsyncIterableIterator<BlogPostData>>();
  const [myAnnouncementsIterator, setMyAnnouncementsIterator] = useState<AsyncIterableIterator<AnnouncementData>>();

  // loading
  const [isLoading, setLoading] = useState(true); // initial loading
  const loadingMore = React.useRef({
    ann: false,
    my: false,
    blog: false,
  }); // loading more for lazy
  const [loadError, setLoadError] = useState(false);
  const loadingIcon = require("../assets/images/loading.gif");

  const [feedType, setFeedType] = useState<"all" | "my" | "blog">("all");

  // toggle between scroll feed and full announcement feed
  const [fullAnn, setAnn] = useState<{
    id: number,
    tags: TagDescriptor[],
    title: string,
    organization: string,
    icon: URLString
    author: string,
    date: Date,
    featured_image: URLString | undefined,
    body: string,
  } | undefined>(undefined);
  function setFullAnnId(id: number) {
    if (id == -1) {
      setAnn(undefined);
      return;
    }

    const ann = (
      feedType === "all" ? allAnnouncementsData :
      feedType === "my" ? myAnnouncementsData :
      blogData
    ).find((e) => e.id === id);

    if (ann === undefined) {
      console.warn("Announcement not found", allAnnouncementsData);
      return;
    }

    setAnn({
      id,
      tags: ann.tags,
      title: ann.title,
      organization: ann.organization,
      icon: ann.iconUrl,
      author: ann.author,
      date: ann.date,
      featured_image: undefined,
      body: ann.body,
    });

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

  // lazy loading check if user at bottom
  function isCloseToBottom({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any): boolean {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 5;
  }

  function changeDropdown() {
    if (lastdropdown == dropdownSelection) return;

    if(["all", "my", "blog"].includes(dropdownSelection)){
      setFeedType(dropdownSelection as any);
    }else{
      console.warn("Invalid dropdown selection", dropdownSelection);
    }
  }

  const onStartup = async () => {
    for (const [i, org] of OrganizationDataHandler._cache.entries()) {
      addOrgs(i, org.name, org.icon);
    }
    for (const [i, tag] of TagDataHandler._cache.entries()) {
      addTags(i, tag.name, tag.color);
    }
    for (const [i, user] of UserDataHandler._cache.entries()) {
      addUsers(
        i,
        user.username,
        user.first_name,
        user.last_name,
        user.graduating_year
      );
    }

    setAnnouncementsIterator(AnnouncementDataHandler.list(sessionContext));
    // setMyAnnouncementsIterator(AnnouncementDataHandler.list(sessionContext, true)); TODO: find api endpoint
    setBlogsIterator(BlogPostDataHandler.list(sessionContext));

    if (myAnnouncementsData.length === 0) {
      setNoMyFeed(true);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (announcementsIterator === undefined) return;

    (async () => {
      await Promise.allSettled([
        loadAnnouncements(false),
        !guestMode.guest && loadAnnouncements(true),
        loadBlogs()
      ]);
    })();
  }, [announcementsIterator]);

  async function loadBlogs() {
    if (loadingMore.current.blog) return;

    loadingMore.current.blog = true;

    try {

      let data: AnnouncementProps[] = [];

      for (let i = 0; i < loadNum; i++) {
        const next = await blogsIterator!.next();
        const ann: BlogPostData = next.value;
        data.push({
          id: ann.id,
          title: ann.title,
          iconUrl: ann.author?.gravatar_url,
          author: ann.author?.username,
          organization: undefined as any,
          date: ann.created_date,
          tags: ann.tags,
          body: ann.body,
        })
      }

      data = blogData.concat(data);

      setBlogData(data);

      setLoadError(false);

    } catch (e) {
      console.error(e);
      setLoadError(true);
    }

    loadingMore.current.blog = false;
  }

  async function loadAnnouncements(my: boolean) {
    if (loadingMore.current[my ? "my" : "ann"]) return;

    loadingMore.current[my ? "my" : "ann"] = true;

    try {

      const iter = my ? myAnnouncementsIterator : announcementsIterator;

      let data: AnnouncementProps[] = [];

      for (let i = 0; i < loadNum; i++) {
        const next = await iter!.next();
        const ann: AnnouncementData = next.value;
        data.push({
          id: ann.id,
          title: ann.title,
          iconUrl: ann.author?.gravatar_url,
          author: ann.author?.username,
          organization: ann.organization?.name,
          date: ann.created_date,
          tags: ann.tags,
          body: ann.body,
        })
      }

      data = (my ? myAnnouncementsData : allAnnouncementsData).concat(data);

      if (my) {
        setMyAnnouncementsData(data);
      } else {
        setAllAnnouncementsData(data);
      }

      setLoadError(false);

    } catch (e) {
      console.error(e);
      setLoadError(true);
    }

    loadingMore.current[my ? "my" : "ann"] = false;
  }

  // fetch data from API
  useEffect(() => { onStartup() }, []);
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
        <View style={{
          backgroundColor:
            colorScheme.scheme === "dark" ? "#252525" : "#eaeaea",
          display: fullAnn ? "none" : undefined,
        }}>
          {dropdown()}
          {feedType === "blog" ?
            /* Blog */
            <AnnouncementsViewer
              announcements={blogData}
              sref={allB}
              isAtBottom={isCloseToBottom}
              loadAnnouncements={loadBlogs}
              setFullAnnId={setFullAnnId}
              isBlog={true}
            />
          : feedType === "all" ?
            /* School Announcements */
            <AnnouncementsViewer
            announcements={allAnnouncementsData}
            sref={allA}
            isAtBottom={isCloseToBottom}
            loadAnnouncements={() => loadAnnouncements(false)}
            setFullAnnId={setFullAnnId}
            isBlog={false}
          /> :
            /* My Feed Announcement */
            <ScrollView><Text>TODO</Text></ScrollView> /*AnnouncementsViewer({
              announcements: myAnnouncementsData,
              sref: myA,
              loadAnnouncements: () => loadAnnouncements(true),
              children:
              (<><View
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
                  &nbsp;
                  <Text
                    style={{ color: "rgb(51,102,187)" }}
                    onPress={() => {
                      navigation.jumpTo("Settings");
                    }}
                  >
                    Log in
                  </Text>
                  &nbsp;to view your personal feed here!
                </Text>
              </View></>)
            })*/ }
        </View>

        {/* Full Announcement */}
        {fullAnn && <ScrollView
          ref={fullA}
          style={styles.scrollView}
        >
          <FullAnnouncement
            {...fullAnn}
            backToScroll={setFullAnnId}
            isBlog={false}
          />
        </ScrollView>}

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
          { label: "All Announcements", value: "all" },
          { label: "My Announcements", value: "my" },
          { label: "Blog", value: "blog" },
        ]}
        multiple={false}
        setValue={setDropdown}
        value={dropdownSelection}
        onChangeValue={(v) => {
          if (v != null && v != lastdropdown) {
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

}

interface AnnouncementProps {
  id: number,
  title: string,
  iconUrl: URLString,
  author: string,
  organization: string,
  date: Date,
  tags: TagDescriptor[],
  body: string,
  children?: React.ReactNode
}

function AnnouncementsViewer({
  announcements,
  sref,
  isAtBottom,
  loadAnnouncements,
  setFullAnnId,
  errored,
  children,
  isBlog,
}: {
  announcements: AnnouncementProps[],
  sref: React.RefObject<ScrollView>,
  isAtBottom: (event: NativeScrollEvent) => boolean,
  loadAnnouncements: () => void,
  setFullAnnId: (id: number) => any,
  errored?: boolean,
  children?: React.ReactNode,
  isBlog: boolean,
}) {
  return (<ScrollView
    ref={sref}
    style={styles.scrollView}
    onScroll={({ nativeEvent }) => { if (isAtBottom(nativeEvent)) loadAnnouncements() }}
    scrollEventThrottle={100}
  >
    {announcements.map((ann, index) => (
      <Announcement key={index} {...ann} showFull={() => (setFullAnnId(ann.id))}>{isBlog ? "See Blog" : "See Announcement"}</Announcement>
    ))}
    {errored ? (
      <View style={styles.error}>
        <Text style={styles.errorMessage}>An error occured.</Text>
        <Button
          title="Retry"
          onPress={loadAnnouncements}
        ></Button>
      </View>
    ) : undefined}

    {children}
  </ScrollView>);
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
