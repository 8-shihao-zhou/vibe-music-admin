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
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">社区数据统计</span>
          <el-button
            type="primary"
            :icon="'Refresh'"
            :loading="loading"
            @click="loadStatistics"
          >
            刷新
          </el-button>
        </div>
      </template>

      <el-row v-loading="loading" :gutter="20" class="statistics-row">
        <!-- 总帖子数 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card stat-card-primary">
            <div class="stat-icon">
              <i class="i-ep-document" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalPosts }}</div>
              <div class="stat-label">总帖子数</div>
            </div>
          </div>
        </el-col>

        <!-- 已发布帖子 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card stat-card-success">
            <div class="stat-icon">
              <i class="i-ep-check" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.publishedPosts }}</div>
              <div class="stat-label">已发布</div>
            </div>
          </div>
        </el-col>

        <!-- 草稿 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card stat-card-warning">
            <div class="stat-icon">
              <i class="i-ep-edit" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.draftPosts }}</div>
              <div class="stat-label">草稿</div>
            </div>
          </div>
        </el-col>

        <!-- 已删除 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card stat-card-danger">
            <div class="stat-icon">
              <i class="i-ep-delete" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.deletedPosts }}</div>
              <div class="stat-label">已删除</div>
            </div>
          </div>
        </el-col>

        <!-- 总评论数 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card stat-card-info">
            <div class="stat-icon">
              <i class="i-ep-chat-line-round" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalComments }}</div>
              <div class="stat-label">总评论数</div>
            </div>
          </div>
        </el-col>

        <!-- 总点赞数 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card stat-card-pink">
            <div class="stat-icon">
              <i class="i-ep-star-filled" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalLikes }}</div>
              <div class="stat-label">总点赞数</div>
            </div>
          </div>
        </el-col>

        <!-- 总浏览数 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card stat-card-purple">
            <div class="stat-icon">
              <i class="i-ep-view" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalViews }}</div>
              <div class="stat-label">总浏览数</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <h3 class="actions-title">快捷操作</h3>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-card
              class="action-card"
              shadow="hover"
              @click="goToPostManagement"
            >
              <div class="action-content">
                <i class="i-ep-document action-icon" />
                <div class="action-text">
                  <div class="action-title">帖子管理</div>
                  <div class="action-desc">查看、编辑、删除帖子</div>
                </div>
                <i class="i-ep-arrow-right action-arrow" />
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-card
              class="action-card"
              shadow="hover"
              @click="goToCommentManagement"
            >
              <div class="action-content">
                <i class="i-ep-chat-line-round action-icon" />
                <div class="action-text">
                  <div class="action-title">评论管理</div>
                  <div class="action-desc">查看、删除评论</div>
                </div>
                <i class="i-ep-arrow-right action-arrow" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.community-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-row {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  .stat-icon {
    font-size: 48px;
    margin-right: 20px;
    opacity: 0.8;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.8;
    }
  }
}

.stat-card-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card-success {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: white;
}

.stat-card-warning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #333;
}

.stat-card-danger {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
}

.stat-card-info {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: white;
}

.stat-card-pink {
  background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
  color: white;
}

.stat-card-purple {
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  color: white;
}

.quick-actions {
  margin-top: 30px;

  .actions-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--el-text-color-primary);
  }

  .action-card {
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 20px;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .action-content {
      display: flex;
      align-items: center;
      padding: 10px;

      .action-icon {
        font-size: 40px;
        color: var(--el-color-primary);
        margin-right: 20px;
      }

      .action-text {
        flex: 1;

        .action-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 5px;
          color: var(--el-text-color-primary);
        }

        .action-desc {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }

      .action-arrow {
        font-size: 20px;
        color: var(--el-text-color-placeholder);
      }
    }
  }
}

.box-card {
  border-radius: 8px;
}
</style>
