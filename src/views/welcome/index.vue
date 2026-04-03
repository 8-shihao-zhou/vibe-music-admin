<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import ReCol from "@/components/ReCol";
import { useDark } from "./utils";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { ChartBar, ChartPie1, ChartPie2 } from "./components/charts";
import useChartData from "./hooks/useChartData";
import GroupLine from "@iconify-icons/ri/group-line";
import Artist from "@iconify-icons/ri/mic-fill";
import Music from "@iconify-icons/ri/music-2-fill";
import Album from "@iconify-icons/ri/album-fill";
import AlarmWarningLine from "@iconify-icons/ri/alarm-warning-line";
import FileList3Line from "@iconify-icons/ri/file-list-3-line";
import ChatSmile3Line from "@iconify-icons/ri/chat-smile-3-line";
import HeartPulseLine from "@iconify-icons/ri/heart-pulse-line";
import FlashlightLine from "@iconify-icons/ri/flashlight-line";
import Notification3Line from "@iconify-icons/ri/notification-3-line";
import CustomerService2Line from "@iconify-icons/ri/customer-service-2-line";
import DiscLine from "@iconify-icons/ri/disc-line";
import ArrowRightUpLine from "@iconify-icons/ri/arrow-right-up-line";
import RefreshLine from "@iconify-icons/ri/refresh-line";

defineOptions({
  name: "Welcome"
});

const router = useRouter();
const { isDark } = useDark();

const {
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
  refreshDashboard
} = useChartData();

const heroStats = computed(() => [
  {
    title: "平台用户",
    value: userCount.value,
    icon: GroupLine,
    accent: "blue"
  },
  {
    title: "音乐资源",
    value: songCount.value,
    icon: Music,
    accent: "emerald"
  },
  {
    title: "社区帖子",
    value: communityStatistics.value.totalPosts,
    icon: ChatSmile3Line,
    accent: "violet"
  },
  {
    title: "待处理事项",
    value: pendingReportCount.value + pendingSongRequestCount.value,
    icon: AlarmWarningLine,
    accent: "amber"
  }
]);

const overviewCards = computed(() => [
  {
    title: "用户总数",
    desc: "平台当前沉淀的用户规模",
    value: userCount.value,
    icon: GroupLine,
    accent: "blue"
  },
  {
    title: "歌手数量",
    desc: "内容库中的歌手与艺人数量",
    value: artistCount.value,
    icon: Artist,
    accent: "orange"
  },
  {
    title: "歌曲数量",
    desc: "可管理的歌曲资源总量",
    value: songCount.value,
    icon: Music,
    accent: "green"
  },
  {
    title: "歌单数量",
    desc: "用户歌单与运营歌单总量",
    value: playlistCount.value,
    icon: Album,
    accent: "purple"
  },
  {
    title: "社区评论",
    desc: "社区累计互动评论量",
    value: communityStatistics.value.totalComments,
    icon: ChatSmile3Line,
    accent: "cyan"
  },
  {
    title: "社区浏览",
    desc: "社区内容累计浏览热度",
    value: communityStatistics.value.totalViews,
    icon: FlashlightLine,
    accent: "indigo"
  },
  {
    title: "待处理举报",
    desc: "需要尽快处理的内容风险项",
    value: pendingReportCount.value,
    icon: AlarmWarningLine,
    accent: "rose"
  },
  {
    title: "待审收录申请",
    desc: "用户提交待审核的歌曲申请",
    value: pendingSongRequestCount.value,
    icon: FileList3Line,
    accent: "amber"
  }
]);

const actionCards = [
  {
    title: "用户管理",
    desc: "查看用户状态、封禁与资料信息",
    path: "/user",
    icon: GroupLine
  },
  {
    title: "歌曲管理",
    desc: "维护歌曲内容与资源信息",
    path: "/song",
    icon: DiscLine
  },
  {
    title: "收录申请",
    desc: "优先处理待审核歌曲申请",
    path: "/song-request",
    icon: FileList3Line
  },
  {
    title: "举报列表",
    desc: "快速进入内容安全处理台",
    path: "/report",
    icon: AlarmWarningLine
  },
  {
    title: "通知管理",
    desc: "发布系统通知与运营公告",
    path: "/notification",
    icon: Notification3Line
  },
  {
    title: "反馈管理",
    desc: "集中处理用户建议和问题",
    path: "/feedback",
    icon: CustomerService2Line
  }
];

const todoCards = computed(() => [
  {
    title: "社区巡检",
    value: communityStatistics.value.totalPosts,
    desc: "当前社区累计帖子，建议优先关注热门内容与异常互动",
    path: "/community/posts"
  },
  {
    title: "举报处理",
    value: pendingReportCount.value,
    desc: "待处理举报需要尽快闭环，避免风险内容继续扩散",
    path: "/report"
  },
  {
    title: "收录审核",
    value: pendingSongRequestCount.value,
    desc: "待审核申请可能影响用户贡献积极性，建议及时处理",
    path: "/song-request"
  }
]);

const contentStructureData = computed(() => [
  { value: userCount.value, name: "用户" },
  { value: artistCount.value, name: "歌手" },
  { value: songCount.value, name: "歌曲" },
  { value: playlistCount.value, name: "歌单" },
  { value: communityStatistics.value.totalPosts, name: "帖子" }
]);

const communityStateData = computed(() => [
  { value: communityStatistics.value.publishedPosts, name: "已发布" },
  { value: communityStatistics.value.draftPosts, name: "草稿" },
  { value: communityStatistics.value.deletedPosts, name: "已删除" }
]);

const styleDistributionData = computed(() => [
  { value: westernPopCount.value, name: "欧美流行" },
  { value: chinesePopCount.value, name: "华语流行" },
  { value: cantonesePopCount.value, name: "粤语流行" },
  { value: koreanPopCount.value, name: "韩国流行" },
  { value: classicCount.value, name: "古典" },
  { value: hiphopCount.value, name: "嘻哈说唱" },
  { value: rockCount.value, name: "摇滚" },
  { value: electronicCount.value, name: "电子" },
  { value: jazzCount.value, name: "爵士布鲁斯" },
  { value: lightCount.value, name: "轻音乐" }
]);

const genderData = computed(() => [
  { value: maleCount.value, name: "男歌手" },
  { value: femaleCount.value, name: "女歌手" }
]);

const artistAreaData = computed(() => [
  countAmerica.value,
  countChina.value,
  countKorea.value,
  countJapan.value,
  countGermany.value,
  countBritain.value
]);

const dashboardScore = computed(() => {
  const base =
    communityStatistics.value.totalPosts +
    communityStatistics.value.totalComments +
    songCount.value +
    playlistCount.value;
  return Math.max(base - pendingReportCount.value * 8 - pendingSongRequestCount.value * 4, 0);
});

const go = (path: string) => router.push(path);
const chartKey = ref(0);
const handleRefresh = async () => {
  await refreshDashboard();
  chartKey.value += 1;
};
</script>

<template>
  <div class="welcome-dashboard" v-loading="loading">
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="hero-badge">AI Music Admin</span>
        <h1>平台总览与运营动态</h1>
        <p>
          在这里统一查看内容规模、社区热度与待跟进事项，让后台状态更清晰、处理节奏更从容。
        </p>
        <div class="hero-actions">
          <el-button type="primary" @click="handleRefresh">
            <IconifyIconOffline :icon="RefreshLine" />
            刷新首页数据
          </el-button>
          <el-button @click="go('/report')">查看举报待办</el-button>
        </div>
      </div>

      <div class="hero-metrics">
        <div
          v-for="item in heroStats"
          :key="item.title"
          class="hero-metric"
          :class="`accent-${item.accent}`"
        >
          <div class="hero-metric-icon">
            <IconifyIconOffline :icon="item.icon" />
          </div>
          <div class="hero-metric-body">
            <span>{{ item.title }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>
    </section>

    <el-row :gutter="20" class="overview-grid">
      <re-col
        v-for="(card, index) in overviewCards"
        :key="card.title"
        v-motion
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        class="mb-[18px]"
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
      >
        <el-card shadow="never" class="overview-card" :class="`accent-${card.accent}`">
          <div class="overview-head">
            <div class="overview-icon">
              <IconifyIconOffline :icon="card.icon" />
            </div>
            <div class="overview-text">
              <span>{{ card.title }}</span>
              <p>{{ card.desc }}</p>
            </div>
          </div>
          <ReNormalCountTo
            :duration="1600"
            :fontSize="'2.3em'"
            :startVal="0"
            :endVal="card.value"
          />
        </el-card>
      </re-col>
    </el-row>

    <div class="content-grid">
      <el-card shadow="never" class="todo-panel">
        <template #header>
          <div class="panel-head">
            <div>
              <h3>运营待办</h3>
              <p>优先处理真正影响平台效率和内容安全的事项</p>
            </div>
            <div class="score-badge">
              <span>平台活跃指数</span>
              <strong>{{ dashboardScore }}</strong>
            </div>
          </div>
        </template>

        <div class="todo-list">
          <div
            v-for="item in todoCards"
            :key="item.title"
            class="todo-item"
            @click="go(item.path)"
          >
            <div class="todo-main">
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
            </div>
            <div class="todo-side">
              <span class="todo-value">{{ item.value }}</span>
              <IconifyIconOffline :icon="ArrowRightUpLine" />
            </div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="action-panel">
        <template #header>
          <div class="panel-head compact">
            <div>
              <h3>快捷入口</h3>
              <p>直接跳到高频后台模块</p>
            </div>
          </div>
        </template>

        <div class="action-grid">
          <button
            v-for="item in actionCards"
            :key="item.title"
            class="action-card"
            type="button"
            @click="go(item.path)"
          >
            <div class="action-icon">
              <IconifyIconOffline :icon="item.icon" />
            </div>
            <div class="action-copy">
              <strong>{{ item.title }}</strong>
              <span>{{ item.desc }}</span>
            </div>
            <IconifyIconOffline :icon="ArrowRightUpLine" class="action-arrow" />
          </button>
        </div>
      </el-card>
    </div>

    <el-row :gutter="20" class="chart-grid">
      <re-col :value="12" :xs="24" class="mb-[18px]">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="panel-head compact">
              <div>
                <h3>平台模块构成</h3>
                <p>从内容资产到社区互动，快速了解后台当前的整体分布</p>
              </div>
            </div>
          </template>
          <ChartPie2 :key="`content-${chartKey}`" :chartData="contentStructureData" />
        </el-card>
      </re-col>

      <re-col :value="12" :xs="24" class="mb-[18px]">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="panel-head compact">
              <div>
                <h3>社区内容状态</h3>
                <p>查看已发布、草稿与清理内容的分布情况，便于把握内容节奏</p>
              </div>
            </div>
          </template>
          <ChartPie2 :key="`community-${chartKey}`" :chartData="communityStateData" />
        </el-card>
      </re-col>

      <re-col :value="12" :xs="24" class="mb-[18px]">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="panel-head compact">
              <div>
                <h3>歌曲曲风分布</h3>
                <p>结合现有曲风标签，辅助判断内容布局与后续补充方向</p>
              </div>
            </div>
          </template>
          <ChartPie1 :key="`style-${chartKey}`" :chartData="styleDistributionData" />
        </el-card>
      </re-col>

      <re-col :value="12" :xs="24" class="mb-[18px]">
        <el-card shadow="never" class="chart-card split-card">
          <template #header>
            <div class="panel-head compact">
              <div>
                <h3>歌手画像</h3>
                <p>作为补充视角，帮助观察地区与性别分布特征</p>
              </div>
            </div>
          </template>

          <ChartBar :key="`area-${chartKey}`" :barChartData="artistAreaData" />
          <div class="divider" />
          <ChartPie2 :key="`gender-${chartKey}`" :chartData="genderData" />
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.welcome-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(360px, 0.9fr);
  gap: 20px;
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgb(106 167 255 / 18%), transparent 30%),
    radial-gradient(circle at bottom right, rgb(87 191 195 / 18%), transparent 34%),
    linear-gradient(135deg, rgb(255 255 255 / 94%), rgb(242 248 252 / 92%));
  border: 1px solid rgb(91 141 239 / 12%);
  box-shadow: 0 14px 34px rgb(71 85 105 / 8%);
  overflow: hidden;

  &::before,
  &::after {
    position: absolute;
    pointer-events: none;
    content: "";
    border-radius: 999px;
    filter: blur(4px);
  }

  &::before {
    top: -60px;
    right: 12%;
    width: 180px;
    height: 180px;
    background: rgb(106 167 255 / 12%);
  }

  &::after {
    right: -40px;
    bottom: -56px;
    width: 140px;
    height: 140px;
    background: rgb(87 191 195 / 12%);
  }
}

.hero-copy {
  position: relative;
  z-index: 1;

  h1 {
    margin: 14px 0 10px;
    font-size: 32px;
    line-height: 1.2;
    color: #203247;
  }

  p {
    max-width: 680px;
    margin: 0;
    color: #5b6d80;
    font-size: 15px;
    line-height: 1.75;
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgb(91 141 239 / 10%);
  color: #4470bf;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.hero-metrics {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.hero-metric {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 108px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgb(91 141 239 / 12%);
  background: rgb(255 255 255 / 88%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 84%);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgb(91 141 239 / 18%);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 84%),
      0 10px 22px rgb(71 85 105 / 8%);
  }
}

.hero-metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgb(91 141 239 / 10%);
  color: #4f7fd6;
  font-size: 22px;
}

.hero-metric-body {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    color: #647587;
    font-size: 13px;
  }

  strong {
    color: #24364b;
    font-size: 28px;
    line-height: 1;
  }
}

.overview-card {
  height: 100%;
  border-radius: 20px;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgb(71 85 105 / 10%);
  }
}

.overview-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.overview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgb(91 141 239 / 10%);
  color: #4d7edf;
  font-size: 22px;
}

.overview-text {
  span {
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: #24364b;
  }

  p {
    margin: 4px 0 0;
    color: #6c7d90;
    font-size: 13px;
    line-height: 1.5;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}

.todo-panel,
.action-panel,
.chart-card {
  border-radius: 22px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  h3 {
    margin: 0;
    font-size: 20px;
    color: #22364a;
  }

  p {
    margin: 6px 0 0;
    color: #697b8e;
    font-size: 13px;
  }

  &.compact {
    h3 {
      font-size: 18px;
    }
  }
}

.score-badge {
  padding: 10px 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgb(91 141 239 / 10%), rgb(87 191 195 / 12%));
  color: #47698f;

  span {
    display: block;
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 24px;
    color: #21384c;
    line-height: 1;
  }
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgb(91 141 239 / 10%);
  background: linear-gradient(180deg, #fff, #f6fafd);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgb(91 141 239 / 18%);
    box-shadow: 0 10px 22px rgb(71 85 105 / 8%);
  }
}

.todo-main {
  strong {
    display: block;
    font-size: 16px;
    color: #24364b;
  }

  p {
    margin: 6px 0 0;
    color: #697b8e;
    font-size: 13px;
    line-height: 1.6;
  }
}

.todo-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  color: #4d7edf;
}

.todo-value {
  font-size: 24px;
  font-weight: 700;
  color: #24364b;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border: 1px solid rgb(91 141 239 / 10%);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff, #f4f9fc);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgb(91 141 239 / 18%);
    box-shadow: 0 10px 22px rgb(71 85 105 / 8%);
  }
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgb(91 141 239 / 10%);
  color: #4d7edf;
  font-size: 20px;
  flex-shrink: 0;
}

.action-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 4px;

  strong {
    color: #24364b;
    font-size: 15px;
  }

  span {
    color: #6b7d8f;
    font-size: 12px;
    line-height: 1.5;
  }
}

.action-arrow {
  color: #7c8ea2;
  font-size: 18px;
  flex-shrink: 0;
}

.split-card :deep(.echarts) {
  width: 100% !important;
}

.divider {
  height: 1px;
  margin: 10px 0 20px;
  background: linear-gradient(90deg, transparent, rgb(91 141 239 / 18%), transparent);
}

.accent-blue .overview-icon,
.accent-blue .hero-metric-icon {
  background: rgb(91 141 239 / 10%);
  color: #4d7edf;
}

.accent-orange .overview-icon,
.accent-orange .hero-metric-icon {
  background: rgb(234 88 12 / 10%);
  color: #d96625;
}

.accent-green .overview-icon,
.accent-green .hero-metric-icon,
.accent-emerald .hero-metric-icon {
  background: rgb(22 163 74 / 10%);
  color: #2e9f67;
}

.accent-purple .overview-icon,
.accent-purple .hero-metric-icon,
.accent-violet .hero-metric-icon {
  background: rgb(124 58 237 / 10%);
  color: #7a54d6;
}

.accent-cyan .overview-icon,
.accent-cyan .hero-metric-icon {
  background: rgb(8 145 178 / 10%);
  color: #2a9bb6;
}

.accent-indigo .overview-icon,
.accent-indigo .hero-metric-icon {
  background: rgb(79 70 229 / 10%);
  color: #5d64da;
}

.accent-rose .overview-icon,
.accent-rose .hero-metric-icon {
  background: rgb(225 29 72 / 10%);
  color: #d94f75;
}

.accent-amber .overview-icon,
.accent-amber .hero-metric-icon {
  background: rgb(245 158 11 / 10%);
  color: #d68a20;
}

@media screen and (width <= 1100px) {
  .hero-panel,
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (width <= 768px) {
  .hero-panel {
    padding: 20px;
  }

  .hero-copy h1 {
    font-size: 26px;
  }

  .hero-actions,
  .hero-metrics,
  .action-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .hero-metrics {
    display: grid;
  }

  .action-grid {
    display: grid;
  }
}
</style>
