<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import {
  getAdminPostList,
  adminDeletePost,
  adminBatchDeletePosts,
  adminToggleTop,
  adminToggleHot
} from "@/api/community";
import { ElMessageBox } from "element-plus";
import { ArrowDown, Delete, Top, HotWater } from "@element-plus/icons-vue";

defineOptions({
  name: "CommunityPostManagement"
});

const loading = ref(false);
const dataList = ref([]);
const selectedRows = ref([]);
const tableRef = ref();

const pagination = reactive({
  total: 0,
  pageNum: 1,
  pageSize: 10
});

const queryForm = reactive({
  category: "",
  keyword: "",
  status: null as number | null
});

// 分类选项
const categories = [
  { label: "全部", value: "" },
  { label: "创作分享", value: "SHARE" },
  { label: "技术交流", value: "TECH" },
  { label: "问答互助", value: "QA" },
  { label: "灌水闲聊", value: "CHAT" }
];

// 状态选项
const statusOptions = [
  { label: "全部", value: null },
  { label: "已发布", value: 1 },
  { label: "草稿", value: 0 },
  { label: "已删除", value: -1 }
];

// 加载帖子列表
const loadPosts = async () => {
  try {
    loading.value = true;
    const response = await getAdminPostList({
      category: queryForm.category || undefined,
      keyword: queryForm.keyword || undefined,
      status: queryForm.status !== null ? queryForm.status : undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    });

    if (response.code === 0) {
      dataList.value = response.data.records || [];
      pagination.total = response.data.total || 0;
    } else {
      message(response.message || "加载失败", { type: "error" });
    }
  } catch (error) {
    console.error("加载帖子列表失败:", error);
    message("加载帖子列表失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1;
  loadPosts();
};

// 重置
const handleReset = () => {
  queryForm.category = "";
  queryForm.keyword = "";
  queryForm.status = null;
  pagination.pageNum = 1;
  loadPosts();
};

// 刷新
const onRefresh = () => {
  pagination.pageNum = 1;
  loadPosts();
};

// 分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  loadPosts();
};

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val;
  loadPosts();
};

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
};

// 置顶/取消置顶
const handleToggleTop = async (row: any) => {
  try {
    const newIsTop = row.isTop === 1 ? 0 : 1;
    const response = await adminToggleTop(row.id, newIsTop);

    if (response.code === 0) {
      message(response.message || "操作成功", { type: "success" });
      loadPosts();
    } else {
      message(response.message || "操作失败", { type: "error" });
    }
  } catch (error) {
    console.error("操作失败:", error);
    message("操作失败", { type: "error" });
  }
};

// 设置/取消热门
const handleToggleHot = async (row: any) => {
  try {
    const newIsHot = row.isHot === 1 ? 0 : 1;
    const response = await adminToggleHot(row.id, newIsHot);

    if (response.code === 0) {
      message(response.message || "操作成功", { type: "success" });
      loadPosts();
    } else {
      message(response.message || "操作失败", { type: "error" });
    }
  } catch (error) {
    console.error("操作失败:", error);
    message("操作失败", { type: "error" });
  }
};

// 删除帖子
const handleDelete = async (row: any, permanent: boolean = false) => {
  try {
    await ElMessageBox.confirm(
      permanent
        ? `确定要永久删除帖子【${row.title}】吗？此操作不可恢复！`
        : `确定要删除帖子【${row.title}】吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    loading.value = true;
    const response = await adminDeletePost(row.id, permanent);

    if (response.code === 0) {
      message(response.message || "删除成功", { type: "success" });
      loadPosts();
    } else {
      message(response.message || "删除失败", { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message("删除失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
};

// 批量删除
const handleBatchDelete = async (permanent: boolean = false) => {
  if (selectedRows.value.length === 0) {
    message("请至少选择一条帖子", { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm(
      permanent
        ? `确定要永久删除选中的 ${selectedRows.value.length} 条帖子吗？此操作不可恢复！`
        : `确定要删除选中的 ${selectedRows.value.length} 条帖子吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    loading.value = true;
    const postIds = selectedRows.value.map((row: any) => row.id);
    const response = await adminBatchDeletePosts(postIds, permanent);

    if (response.code === 0) {
      message(response.message || "删除成功", { type: "success" });
      selectedRows.value = [];
      tableRef.value?.clearSelection();
      loadPosts();
    } else {
      message(response.message || "删除失败", { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("批量删除失败:", error);
      message("批量删除失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
};

// 获取状态标签类型
const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return "success";
    case 0:
      return "warning";
    case -1:
      return "danger";
    default:
      return "info";
  }
};

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return "已发布";
    case 0:
      return "草稿";
    case -1:
      return "已删除";
    default:
      return "未知";
  }
};

// 获取分类文本
const getCategoryText = (category: string) => {
  const cat = categories.find(c => c.value === category);
  return cat ? cat.label : category;
};

onMounted(() => {
  loadPosts();
});
</script>

<template>
  <div class="post-management">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">帖子管理</span>
        </div>
      </template>

      <!-- 查询表单 -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="分类">
          <el-select
            v-model="queryForm.category"
            placeholder="请选择分类"
            clearable
          >
            <el-option
              v-for="cat in categories"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="搜索标题或内容"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="'Search'" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="'Refresh'" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <el-button
          type="danger"
          :icon="'Delete'"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete(false)"
        >
          批量删除 ({{ selectedRows.length }})
        </el-button>
        <el-button
          type="danger"
          plain
          :icon="'Delete'"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete(true)"
        >
          永久删除 ({{ selectedRows.length }})
        </el-button>
        <el-button
          type="primary"
          :icon="'Refresh'"
          :loading="loading"
          @click="onRefresh"
        >
          刷新
        </el-button>
      </div>

      <!-- 帖子列表表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="dataList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column
          prop="title"
          label="标题"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="username"
          label="作者"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="category"
          label="分类"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ getCategoryText(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="viewCount"
          label="浏览"
          width="70"
          align="center"
        />
        <el-table-column
          prop="likeCount"
          label="点赞"
          width="70"
          align="center"
        />
        <el-table-column
          prop="commentCount"
          label="评论"
          width="70"
          align="center"
        />
        <el-table-column prop="isTop" label="置顶" width="70" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isTop === 1" type="warning" size="small"
              >置顶</el-tag
            >
            <span v-else />
          </template>
        </el-table-column>
        <el-table-column prop="isHot" label="热门" width="70" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isHot === 1" type="danger" size="small"
              >热门</el-tag
            >
            <span v-else />
          </template>
        </el-table-column>
        <el-table-column
          prop="isHighlight"
          label="高亮"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.isHighlight === true" type="success" size="small"
              >高亮</el-tag
            >
            <span v-else />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="160"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="80" fixed="right" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button link type="primary" size="small">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleToggleTop(row)">
                    <el-icon><top /></el-icon>
                    <span>{{ row.isTop === 1 ? "取消置顶" : "置顶" }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleToggleHot(row)">
                    <el-icon><hot-water /></el-icon>
                    <span>{{ row.isHot === 1 ? "取消热门" : "设为热门" }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleDelete(row, false)">
                    <el-icon><delete /></el-icon>
                    <span>删除</span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === -1"
                    @click="handleDelete(row, true)"
                  >
                    <el-icon><delete /></el-icon>
                    <span style="color: #f56c6c">永久删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
.post-management {
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
