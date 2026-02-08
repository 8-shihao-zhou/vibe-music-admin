<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { http } from "@/utils/http";
import { ElMessageBox } from "element-plus";

defineOptions({
  name: "NotificationHistory"
});

const loading = ref(false);
const dataList = ref([]);
const selectedRows = ref([]); // 选中的行
const pagination = reactive({
  total: 0,
  pageNum: 1,
  pageSize: 10
});

// 加载通知历史
const loadHistory = async () => {
  try {
    loading.value = true;
    const response = await http.request("get", "/notification/admin/history", {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize
      }
    });

    // 后端返回的code: 0表示成功，1表示失败
    if (response.code === 0) {
      dataList.value = response.data.records;
      pagination.total = response.data.total;
    } else {
      message(response.message || response.msg || "加载失败", { type: "error" });
    }
  } catch (error) {
    console.error("加载通知历史失败:", error);
    message("加载通知历史失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// 分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  loadHistory();
};

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val;
  loadHistory();
};

// 刷新
const onRefresh = () => {
  pagination.pageNum = 1;
  loadHistory();
};

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
};

// 批量删除通知
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    message("请至少选择一条通知", { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条通知吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    loading.value = true;
    
    // 逐个删除选中的通知
    const deletePromises = selectedRows.value.map((row: any) =>
      http.request("delete", `/notification/admin/delete/${row.id}`)
    );

    const results = await Promise.all(deletePromises);
    
    // 检查是否全部删除成功
    const allSuccess = results.every((res: any) => res.code === 0);
    
    if (allSuccess) {
      message(`成功删除 ${selectedRows.value.length} 条通知`, { type: "success" });
      selectedRows.value = [];
      loadHistory();
    } else {
      message("部分通知删除失败", { type: "warning" });
      loadHistory();
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("批量删除通知失败:", error);
      message("批量删除失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
};

// 删除通知（保留单个删除方法，以防需要）
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除通知【${row.title}】吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "notification-delete-confirm"
      }
    );

    loading.value = true;
    const response = await http.request(
      "delete",
      `/notification/admin/delete/${row.id}`
    );

    if (response.code === 0) {
      message("删除成功", { type: "success" });
      loadHistory();
    } else {
      message(response.message || "删除失败", { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除通知失败:", error);
      message("删除失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadHistory();
});
</script>

<template>
  <div class="notification-history">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">通知历史</span>
          <div class="header-actions">
            <el-button
              type="danger"
              :icon="'Delete'"
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              删除选中 ({{ selectedRows.length }})
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
        </div>
      </template>

      <!-- 通知列表表格 -->
      <el-table 
        v-loading="loading" 
        :data="dataList" 
        style="width: 100%"
        table-layout="fixed"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="接收者ID" width="100" />
        <el-table-column
          prop="title"
          label="标题"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="content"
          label="内容"
          min-width="300"
          show-overflow-tooltip
        />
        <el-table-column prop="isRead" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isRead === 1 ? 'success' : 'info'">
              {{ row.isRead === 1 ? "已读" : "未读" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="readTime" label="阅读时间" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.readTime || "-" }}
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
.notification-history {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.box-card {
  border-radius: 8px;
}
</style>

<style lang="scss">
/* 全局样式，确保删除确认框不被遮挡 */
.notification-delete-confirm {
  z-index: 9999 !important;
}

.el-overlay {
  z-index: 9998 !important;
}
</style>
