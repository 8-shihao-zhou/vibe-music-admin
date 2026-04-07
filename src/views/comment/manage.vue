<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { adminDeleteComment, getAdminCommentList } from "@/api/comment";

defineOptions({
  name: "CommonCommentManagement"
});

const route = useRoute();
const loading = ref(false);
const dataList = ref([]);

// 根据路由元信息区分当前是歌曲评论还是歌单评论
const commentType = computed(() => Number(route.meta.commentType ?? 0));
const pageTitle = computed(() => String(route.meta.title || "评论管理"));
const targetTitleLabel = computed(() =>
  commentType.value === 0 ? "所属歌曲" : "所属歌单"
);

const pagination = reactive({
  total: 0,
  pageNum: 1,
  pageSize: 10
});

const queryForm = reactive({
  keyword: ""
});

// 加载评论列表
const loadComments = async () => {
  try {
    loading.value = true;
    const response = await getAdminCommentList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: queryForm.keyword || undefined,
      type: commentType.value
    });

    if (response.code === 0) {
      dataList.value = response.data.records || [];
      pagination.total = response.data.total || 0;
    } else {
      message(response.message || "加载评论列表失败", { type: "error" });
    }
  } catch (error) {
    console.error("加载评论列表失败:", error);
    message("加载评论列表失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1;
  loadComments();
};

// 重置
const handleReset = () => {
  queryForm.keyword = "";
  pagination.pageNum = 1;
  loadComments();
};

// 刷新
const handleRefresh = () => {
  pagination.pageNum = 1;
  loadComments();
};

// 切换每页条数
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  loadComments();
};

// 切换页码
const handleCurrentChange = (val: number) => {
  pagination.pageNum = val;
  loadComments();
};

// 删除评论
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm("确定要删除这条评论吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    loading.value = true;
    const response = await adminDeleteComment(row.commentId);

    if (response.code === 0) {
      message(response.message || "删除成功", { type: "success" });
      loadComments();
    } else {
      message(response.message || "删除失败", { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除评论失败:", error);
      message("删除评论失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadComments();
});
</script>

<template>
  <div class="comment-management">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">{{ pageTitle }}</span>
        </div>
      </template>

      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="搜索评论内容 / 用户名 / 目标标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="toolbar">
        <el-button
          type="primary"
          :loading="loading"
          @click="handleRefresh"
        >
          刷新
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="dataList"
        style="width: 100%"
        table-layout="fixed"
      >
        <el-table-column prop="commentId" label="评论ID" width="90" />
        <el-table-column prop="username" label="评论用户" width="140" />
        <el-table-column :prop="'targetTitle'" :label="targetTitleLabel" min-width="220" show-overflow-tooltip />
        <el-table-column prop="content" label="评论内容" min-width="320" show-overflow-tooltip />
        <el-table-column prop="likeCount" label="点赞数" width="100" />
        <el-table-column prop="createTime" label="评论时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.comment-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-form {
  margin-bottom: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.box-card {
  border-radius: 8px;
}
</style>
