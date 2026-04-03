import {
  getAllUsersCount,
  getAllArtistsCount,
  getAllSongsCount,
  getAllPlaylistsCount
} from "@/api/data";
import { getCommunityStatistics } from "@/api/community";
import { getReportList } from "@/api/report";
import { getSongRequestList } from "@/api/system";
import { onMounted, ref } from "vue";
import { message } from "@/utils/message";

const defaultCommunityStatistics = () => ({
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  deletedPosts: 0,
  totalComments: 0,
  totalLikes: 0,
  totalViews: 0
});

export default () => {
  const loading = ref(false);

  /** core totals */
  const userCount = ref<number>(0);
  const artistCount = ref<number>(0);
  const songCount = ref<number>(0);
  const playlistCount = ref<number>(0);

  /** operations */
  const pendingReportCount = ref<number>(0);
  const pendingSongRequestCount = ref<number>(0);
  const communityStatistics = ref(defaultCommunityStatistics());

  /** song styles */
  const westernPopCount = ref<number>(0);
  const chinesePopCount = ref<number>(0);
  const cantonesePopCount = ref<number>(0);
  const koreanPopCount = ref<number>(0);
  const classicCount = ref<number>(0);
  const hiphopCount = ref<number>(0);
  const rockCount = ref<number>(0);
  const electronicCount = ref<number>(0);
  const jazzCount = ref<number>(0);
  const lightCount = ref<number>(0);

  /** artist regions */
  const countAmerica = ref<number>(0);
  const countChina = ref<number>(0);
  const countKorea = ref<number>(0);
  const countJapan = ref<number>(0);
  const countGermany = ref<number>(0);
  const countBritain = ref<number>(0);

  /** artist genders */
  const maleCount = ref<number>(0);
  const femaleCount = ref<number>(0);

  const songTypes = [
    "欧美流行",
    "华语流行",
    "粤语流行",
    "韩国流行",
    "古典",
    "嘻哈说唱",
    "摇滚",
    "电子",
    "爵士布鲁斯",
    "轻音乐"
  ];

  const artistAreas = ["美国", "中国", "韩国", "日本", "德国", "英国"];
  const artistGenders = [0, 1];

  const resetCounts = () => {
    userCount.value = 0;
    artistCount.value = 0;
    songCount.value = 0;
    playlistCount.value = 0;
    pendingReportCount.value = 0;
    pendingSongRequestCount.value = 0;
    communityStatistics.value = defaultCommunityStatistics();
    westernPopCount.value = 0;
    chinesePopCount.value = 0;
    cantonesePopCount.value = 0;
    koreanPopCount.value = 0;
    classicCount.value = 0;
    hiphopCount.value = 0;
    rockCount.value = 0;
    electronicCount.value = 0;
    jazzCount.value = 0;
    lightCount.value = 0;
    countAmerica.value = 0;
    countChina.value = 0;
    countKorea.value = 0;
    countJapan.value = 0;
    countGermany.value = 0;
    countBritain.value = 0;
    maleCount.value = 0;
    femaleCount.value = 0;
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const songTypePromises = songTypes.map(type => getAllSongsCount(type));
      const artistAreaPromises = artistAreas.map(area =>
        getAllArtistsCount(undefined, area)
      );
      const artistGenderPromises = artistGenders.map(gender =>
        getAllArtistsCount(gender)
      );

      const allResponses = await Promise.all([
        getAllUsersCount(),
        getAllArtistsCount(),
        getAllSongsCount(),
        getAllPlaylistsCount(),
        getCommunityStatistics(),
        getReportList({ pageNum: 1, pageSize: 1, status: 0 }),
        getSongRequestList({ pageNum: 1, pageSize: 1, status: 0, keyword: "" }),
        ...songTypePromises,
        ...artistAreaPromises,
        ...artistGenderPromises
      ]);

      const baseResponses = allResponses.slice(0, 7);
      const songTypeResponses = allResponses.slice(7, 7 + songTypes.length);
      const artistAreaResponses = allResponses.slice(
        7 + songTypes.length,
        7 + songTypes.length + artistAreas.length
      );
      const artistGenderResponses = allResponses.slice(
        7 + songTypes.length + artistAreas.length
      );

      const [
        userRes,
        artistRes,
        songRes,
        playlistRes,
        communityRes,
        reportRes,
        songRequestRes
      ] = baseResponses;

      const metricMappings = [
        [userRes, userCount],
        [artistRes, artistCount],
        [songRes, songCount],
        [playlistRes, playlistCount]
      ] as const;

      let allSuccess = true;

      metricMappings.forEach(([response, countRef], index) => {
        if (!response || response.code !== 0 || isNaN(Number(response.data))) {
          allSuccess = false;
          console.error(`Failed to load metric #${index + 1}`, response);
          return;
        }
        countRef.value = Number(response.data);
      });

      if (communityRes?.code === 0 && communityRes.data) {
        communityStatistics.value = {
          ...defaultCommunityStatistics(),
          ...communityRes.data
        };
      } else {
        allSuccess = false;
      }

      if (reportRes?.code === 0 && reportRes.data) {
        pendingReportCount.value = Number(reportRes.data.total || 0);
      } else {
        allSuccess = false;
      }

      if (songRequestRes?.code === 0 && songRequestRes.data) {
        pendingSongRequestCount.value = Number(songRequestRes.data.total || 0);
      } else {
        allSuccess = false;
      }

      const chartRefs = [
        westernPopCount,
        chinesePopCount,
        cantonesePopCount,
        koreanPopCount,
        classicCount,
        hiphopCount,
        rockCount,
        electronicCount,
        jazzCount,
        lightCount,
        countAmerica,
        countChina,
        countKorea,
        countJapan,
        countGermany,
        countBritain,
        maleCount,
        femaleCount
      ];

      [...songTypeResponses, ...artistAreaResponses, ...artistGenderResponses].forEach(
        (response, index) => {
          if (!response || response.code !== 0 || isNaN(Number(response.data))) {
            allSuccess = false;
            console.error(`Failed to load chart metric #${index + 1}`, response);
            return;
          }
          chartRefs[index].value = Number(response.data);
        }
      );

      if (!allSuccess) {
        message("部分首页数据加载失败，已展示当前可用内容", { type: "warning" });
      }
    } catch (error) {
      console.error("Failed to load welcome dashboard data:", error);
      message("首页数据加载失败，请稍后重试", { type: "error" });
      resetCounts();
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchData);

  return {
    loading,
    userCount,
    artistCount,
    songCount,
    playlistCount,
    pendingReportCount,
    pendingSongRequestCount,
    communityStatistics,
    westernPopCount,
    chinesePopCount,
    cantonesePopCount,
    koreanPopCount,
    classicCount,
    hiphopCount,
    rockCount,
    electronicCount,
    jazzCount,
    lightCount,
    countAmerica,
    countChina,
    countKorea,
    countJapan,
    countGermany,
    countBritain,
    maleCount,
    femaleCount,
    refreshDashboard: fetchData
  };
};
