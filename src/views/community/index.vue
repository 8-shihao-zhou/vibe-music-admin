<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { getCommunityStatistics } from "@/api/community";
import { useRouter } from "vue-router";

defineOptions({
  name: "CommunityManagement"
});

const router = useRouter();
const loading = ref(false);
const statistics = ref({
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  deletedPosts: 0,
  totalComments: 0,
  totalLikes: 0,
  totalViews: 0
});

// 加载统计数据
const loadStatistics = async () => {
  try {
    loading.value = true;
    const response = await getCommunityStatistics();

    if (response.code === 0) {
      statistics.value = response.data;
    } else {
      message(response.message || "加载失败", { type: "error" });
    }
  } catch (error) {
    console.error("加载统计数据失败:", error);
    message("加载统计数据失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// 跳转到帖子管理
const goToPostManagement = () => {
  router.push("/community/posts");
};

// 跳转到评论管理
const goToCommentManagement = () => {
  router.push("/community/comments");
};

onMounted(() => {
  loadStatistics();
});
</script>

<template>
  <div class="community-management">
    <div class="overview-head">
      <div class="head-left">
        <h2>社区控制台</h2>
        <p>实时掌握帖子、评论与互动数据</p>
      </div>
      <el-button
        type="primary"
        :loading="loading"
        class="refresh-btn"
        @click="loadStatistics"
      >
        <i class="i-ep-refresh-right" />
        刷新数据
      </el-button>
    </div>

    <el-row v-loading="loading" :gutter="18" class="statistics-row">
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="stat-card stat-card-primary">
          <div class="stat-top">
            <span>总帖子数</span><i class="i-ep-document" />
          </div>
          <div class="stat-value">{{ statistics.totalPosts }}</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="stat-card stat-card-success">
          <div class="stat-top">
            <span>已发布</span><i class="i-ep-check" />
          </div>
          <div class="stat-value">{{ statistics.publishedPosts }}</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="stat-card stat-card-warning">
          <div class="stat-top"><span>草稿</span><i class="i-ep-edit" /></div>
          <div class="stat-value">{{ statistics.draftPosts }}</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="stat-card stat-card-danger">
          <div class="stat-top">
            <span>已删除</span><i class="i-ep-delete" />
          </div>
          <div class="stat-value">{{ statistics.deletedPosts }}</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="stat-card stat-card-info">
          <div class="stat-top">
            <span>总评论数</span><i class="i-ep-chat-line-round" />
          </div>
          <div class="stat-value">{{ statistics.totalComments }}</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="stat-card stat-card-pink">
          <div class="stat-top">
            <span>总点赞数</span><i class="i-ep-star-filled" />
          </div>
          <div class="stat-value">{{ statistics.totalLikes }}</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="stat-card stat-card-purple">
          <div class="stat-top">
            <span>总浏览数</span><i class="i-ep-view" />
          </div>
          <div class="stat-value">{{ statistics.totalViews }}</div>
        </div>
      </el-col>
    </el-row>

    <div class="quick-actions">
      <h3 class="actions-title">快捷操作</h3>
      <el-row :gutter="18">
        <el-col :xs="24" :sm="12">
          <div class="action-card" @click="goToPostManagement">
            <div class="action-content">
              <i class="i-ep-document action-icon" />
              <div class="action-text">
                <div class="action-title">帖子管理</div>
                <div class="action-desc">查看、编辑、删除帖子</div>
              </div>
              <span class="action-pill">立即进入</span>
              <i class="i-ep-arrow-right action-arrow" />
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12">
          <div class="action-card" @click="goToCommentManagement">
            <div class="action-content">
              <i class="i-ep-chat-line-round action-icon" />
              <div class="action-text">
                <div class="action-title">评论管理</div>
                <div class="action-desc">查看、删除评论</div>
              </div>
              <span class="action-pill">立即进入</span>
              <i class="i-ep-arrow-right action-arrow" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.community-management {
  position: relative;
  padding: 18px;
  border-radius: 22px;
  background: radial-gradient(
      circle at 14% 10%,
      rgb(168 85 247 / 20%),
      transparent 32%
    ),
    radial-gradient(circle at 88% 12%, rgb(6 182 212 / 18%), transparent 32%),
    radial-gradient(circle at 72% 84%, rgb(59 130 246 / 16%), transparent 34%),
    linear-gradient(145deg, #eef4ff 0%, #eaf1ff 45%, #f4f8ff 100%);
  border: 1px solid rgb(99 102 241 / 22%);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 74%),
    0 18px 40px rgb(30 64 175 / 15%);
}

.overview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid rgb(99 102 241 / 20%);
  background: linear-gradient(
    120deg,
    rgb(255 255 255 / 82%),
    rgb(244 248 255 / 86%)
  );
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 24px rgb(30 64 175 / 10%);

  .head-left {
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1f2a44;
      letter-spacing: 0.6px;
    }

    p {
      margin: 6px 0 0;
      color: #667085;
      font-size: 14px;
    }
  }

  .refresh-btn {
    border: 1px solid rgb(79 70 229 / 20%);
    padding: 0 20px;
    height: 40px;
    border-radius: 999px;
    font-weight: 700;
    letter-spacing: 0.5px;
    background: linear-gradient(95deg, #4f46e5 0%, #7c3aed 40%, #06b6d4 100%);
    box-shadow:
      0 10px 20px rgb(79 70 229 / 44%),
      inset 0 0 0 1px rgb(255 255 255 / 28%);
    transition: all 0.25s ease;

    :deep(span) {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    &:hover {
      transform: translateY(-1px) scale(1.02);
      box-shadow:
        0 14px 28px rgb(79 70 229 / 34%),
        0 0 18px rgb(34 211 238 / 24%);
    }
  }
}

.statistics-row {
  margin-bottom: 8px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  padding: 18px 20px;
  border-radius: 16px;
  margin-bottom: 18px;
  border: 1px solid rgb(255 255 255 / 24%);
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 16px 34px rgb(1 8 25 / 38%);
  }

  &::after {
    content: "";
    position: absolute;
    inset: auto -35% -40% auto;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: rgb(255 255 255 / 24%);
  }

  .stat-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    opacity: 1;

    i {
      font-size: 24px;
      padding: 8px;
      border-radius: 12px;
      background: rgb(255 255 255 / 22%);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 28%);
    }
  }

  .stat-value {
    position: relative;
    z-index: 2;
    font-size: 42px;
    line-height: 1;
    font-weight: 700;
  }
}

.stat-card-primary {
  background: linear-gradient(140deg, #263a9a 0%, #6842bf 58%, #a855f7 100%);
  color: white;
}

.stat-card-success {
  background: linear-gradient(140deg, #0f766e 0%, #0ea5e9 56%, #22d3ee 100%);
  color: white;
}

.stat-card-warning {
  background: linear-gradient(140deg, #92400e 0%, #ea580c 58%, #f59e0b 100%);
  color: #fff;
}

.stat-card-danger {
  background: linear-gradient(140deg, #9f1239 0%, #e11d48 58%, #fb7185 100%);
  color: white;
}

.stat-card-info {
  background: linear-gradient(140deg, #1e3a8a 0%, #2563eb 58%, #38bdf8 100%);
  color: white;
}

.stat-card-pink {
  background: linear-gradient(140deg, #7e22ce 0%, #c026d3 56%, #f472b6 100%);
  color: white;
}

.stat-card-purple {
  background: linear-gradient(140deg, #312e81 0%, #4f46e5 56%, #22d3ee 100%);
  color: white;
}

.quick-actions {
  margin-top: 6px;
  padding: 6px;

  .actions-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 14px;
    color: #243b63;
  }

  .action-card {
    border: 1px solid rgb(99 102 241 / 18%);
    border-radius: 16px;
    background: linear-gradient(
      120deg,
      rgb(255 255 255 / 92%),
      rgb(243 248 255 / 88%)
    );
    cursor: pointer;
    transition: all 0.25s ease;
    margin-bottom: 20px;
    box-shadow: 0 10px 24px rgb(30 64 175 / 10%);

    &:hover {
      transform: translateY(-5px);
      border-color: rgb(56 189 248 / 54%);
      box-shadow:
        0 18px 34px rgb(6 182 212 / 16%),
        0 0 22px rgb(79 70 229 / 16%);
    }

    .action-content {
      display: flex;
      align-items: center;
      padding: 10px;

      .action-icon {
        font-size: 36px;
        color: #4f46e5;
        margin-right: 20px;
      }

      .action-text {
        flex: 1;

        .action-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 5px;
          color: #1f2a44;
        }

        .action-desc {
          font-size: 14px;
          color: #6b7280;
        }
      }

      .action-pill {
        margin-right: 14px;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid rgb(79 70 229 / 18%);
        background: linear-gradient(
          90deg,
          rgb(79 70 229 / 46%),
          rgb(6 182 212 / 44%)
        );
        color: #f7fbff;
        font-size: 12px;
        font-weight: 600;
      }

      .action-arrow {
        font-size: 20px;
        color: #4b5563;
      }
    }
  }
}
</style>
