import * as React from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Image,
  Button,
  NativeScrollEvent,
} from "react-native";
import { Text, View } from "../components/Themed";
import Announcement from "../components/Announcement";
import FullAnnouncement from "../components/FullAnnouncement";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import DropDownPicker from "react-native-dropdown-picker";
import { ThemeContext } from "../hooks/useColorScheme";
import { GuestModeContext } from "../hooks/useGuestMode";
import { BottomTabParamList } from "../types";
import { AnnouncementData, BlogPostData, URLString, TagDescriptor } from '../api';
import { AnnouncementDataHandler, BlogPostDataHandler, OrganizationDataHandler, TagDataHandler, UserDataHandler } from '../api/impl';
import { SessionContext } from "../util/session";
// @ts-ignore
import loadingIcon from "../assets/images/loading.gif";

export default function NewsScreen({
  navigation,
}: {
  navigation: BottomTabNavigationProp<BottomTabParamList, "News">;
}) {
  // get color scheme
  const colorScheme = React.useContext(ThemeContext);
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
  /*
  const [sacAnnouncements, setSacAnnouncements] = useState<AnnouncementData[]>([]);
  */
  const [allAnnouncementsData, setAllAnnouncementsData] = useState<AnnouncementProps[]>([]);
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

  // tracking how many announcements have been loaded
  /*
  const [nextSacSet, setNextSacSet] = useState(0);
  */
  // api iterators

  const [announcementsIterator, setAnnouncementsIterator] = useState<AsyncIterableIterator<AnnouncementData>>();
  const [blogsIterator, setBlogsIterator] = useState<AsyncIterableIterator<BlogPostData>>();

  // loading
  const [isLoading, setLoading] = useState(true); // initial loading
  const loadingMore = React.useRef({
    ann: false,
    blog: false,
  }); // loading more for lazy
  const [loadError, setLoadError] = useState(false); // TODO this is never used?

  const [feedType, setFeedType] = useState<"all" | "blog">("all");

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
      feedType === "all" ? allAnnouncementsData : blogData
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

  // //displayed info if nothing in feed
  // const [noMyFeed, setNoMyFeed] = useState(false);

  // scrollview reset to top on switch toggle
  const allA = React.useRef<ScrollView>(null);
  const sacA = React.useRef<ScrollView>(null);
  const allB = React.useRef<ScrollView>(null);
  const fullA = React.useRef<ScrollView>(null);

  const [dropdownSelection, setDropdown] = useState("all");
  const [lastdropdown, setLastDropdown] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // lazy loading check if user at bottom
  function isCloseToBottom({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any): boolean {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 5;
  }

  /*
  function changeDropdown(): void {
    if(lastdropdown == dropdownSelection) return;
    if (dropdownSelection === "All Announcements") {
      allA.current?.scrollTo({ x: 0, y: 0, animated: false });
      setFilter(false);
    }
    if (dropdownSelection === "SAC Announcements") {
      sacA.current?.scrollTo({ x: 0, y: 0, animated: false });
      setFilter(true);
    }
    if (dropdownSelection === "Blog") {
      allB.current?.scrollTo({ x: 0, y: 0, animated: false });
      setBlog(true);
    } else {
      setBlog(false);
  */
  function changeDropdown() {
    if (lastdropdown == dropdownSelection) return;

    if(["all", "blog"].includes(dropdownSelection)){
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
    // TODO: SAC announcements iterator
    setBlogsIterator(BlogPostDataHandler.list(sessionContext));

    setLoading(false);
  };

  React.useEffect(() => {
    if (announcementsIterator === undefined) return;

    (async () => {
      await Promise.allSettled([
        loadAnnouncements(),
        loadBlogs()
      ]);
    })();
  }, [announcementsIterator]);

  /*
  const loadSacAnnouncements = async () =>
    loadResults(
      `/api/v3/obj/announcement?format=json&organization=8&limit=${loadNum}&offset=${nextSacSet}`,
      setSacAnnouncements,
      setNextSacSet
    );
  */
  async function loadAnnouncements() {
    if (loadingMore.current.ann) return;

    loadingMore.current.ann = true;

    try {

      let data: AnnouncementProps[] = [];

      for (let i = 0; i < loadNum; i++) {
        const next = await announcementsIterator!.next();
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

      setAllAnnouncementsData(allAnnouncementsData.concat(data));

      setLoadError(false);

    } catch (e) {
      console.error(e);
      setLoadError(true);
    }

    loadingMore.current.ann = false;
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
        {/* Sac Feed Announcement
        { !isBlog && isFilter && fullAnnId === "-1" && <ScrollView
          ref={sacA}
          style={styles.scrollView}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) loadSacAnnouncements();
          }}
          scrollEventThrottle={0}
        >
          {Object.entries(sacAnnouncements).map(([key, ann]) => (
            <Announcement key={key} ann={ann} fullAnn={setFullAnnId} />
          ))}
          {loadError ? (
            <View style={styles.error}>
              <Text style={styles.errorMessage}>An error occured.</Text>
              <Button
                title="Retry"
                onPress={() => {
                  loadSacAnnouncements();
                }}
              ></Button>
            </View>
          ) : undefined} */}

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
          : 
            /* School Announcements */
            <AnnouncementsViewer
              announcements={allAnnouncementsData}
              sref={allA}
              isAtBottom={isCloseToBottom}
              loadAnnouncements={() => loadAnnouncements()}
              setFullAnnId={setFullAnnId}
              isBlog={false}
            />
          }
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
        items={[/*
          { label: "All Announcements", value: "All Announcements" },
          { label: "SAC Announcements", value: "SAC Announcements" },
          { label: "Blog", value: "Blog" },*/
          { label: "All Announcements", value: "all" },
          { label: "Blog", value: "blog" },
        ]}
        multiple={false}
        setValue={setDropdown}
        value={dropdownSelection}
        onChangeValue={(v) => {
          if(v != null && v != lastdropdown) {
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
