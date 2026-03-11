<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getReportList, handleReport, rejectReport } from "@/api/report";

const loading = ref(false);
const reportList = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const statusFilter = ref<number | undefined>(undefined);
const typeFilter = ref<number | undefined>(undefined);

const statusOptions = [
  { label: "全部", value: undefined },
  { label: "待处理", value: 0 },
  { label: "已处理", value: 1 },
  { label: "已驳回", value: 2 }
];

const typeOptions = [
  { label: "全部", value: undefined },
  { label: "帖子", value: 1 },
  { label: "评论", value: 2 }
];

const reasonTypeMap: Record<string, string> = {
  SPAM: "垃圾广告",
  ILLEGAL: "违规内容",
  ABUSE: "侮辱谩骂",
  PORN: "色情低俗",
  FAKE: "虚假信息",
  COPYRIGHT: "侵权内容",
  OTHER: "其他"
};

const fetchReportList = async () => {
  loading.value = true;
  try {
    const res = await getReportList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      status: statusFilter.value,
      targetType: typeFilter.value
    });

    if (res.code === 0 && res.data) {
      reportList.value = res.data.records || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.message || "获取举报列表失败");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("网络错误");
  } finally {
    loading.value = false;
  }
};

const handleReportAction = async (reportId: number) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入处理结果", "处理举报", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: /.+/,
      inputErrorMessage: "请输入处理结果"
    });

    const res = await handleReport(reportId, value);
    if (res.code === 0) {
      ElMessage.success("处理成功");
      fetchReportList();
    } else {
      ElMessage.error(res.message || "处理失败");
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("操作失败");
    }
  }
};

const rejectReportAction = async (reportId: number) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入驳回原因", "驳回举报", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: /.+/,
      inputErrorMessage: "请输入驳回原因"
    });

    const res = await rejectReport(reportId, value);
    if (res.code === 0) {
      ElMessage.success("驳回成功");
      fetchReportList();
    } else {
      ElMessage.error(res.message || "驳回失败");
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("操作失败");
    }
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchReportList();
};

onMounted(fetchReportList);
</script>

<template>
  <div class="report-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">举报管理</span>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select
          v-model="statusFilter"
          placeholder="处理状态"
          style="width: 150px"
          @change="fetchReportList"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.label"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-select
          v-model="typeFilter"
          placeholder="举报类型"
          style="width: 150px"
          @change="fetchReportList"
        >
          <el-option
            v-for="option in typeOptions"
            :key="option.label"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-button @click="fetchReportList">
          <i class="i-carbon-renew mr-1" />
          刷新
        </el-button>
      </div>

      <!-- 举报列表 -->
      <el-table v-loading="loading" :data="reportList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="reporterName" label="举报人" width="120" />
        <el-table-column label="举报目标" width="100">
          <template #default="{ row }">
            <el-tag :type="row.targetType === 1 ? 'primary' : 'success'">
              {{ row.targetType === 1 ? "帖子" : "评论" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="targetContent"
          label="内容预览"
          show-overflow-tooltip
          min-width="200"
        />
        <el-table-column prop="targetAuthorName" label="作者" width="120" />
        <el-table-column label="举报原因" width="120">
          <template #default="{ row }">
            {{ reasonTypeMap[row.reasonType] || row.reasonType }}
          </template>
        </el-table-column>
        <el-table-column
          prop="reasonDetail"
          label="详细说明"
          show-overflow-tooltip
          min-width="150"
        />
        <el-table-column label="举报次数" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.reportCount >= 5" type="danger">{{
              row.reportCount
            }}</el-tag>
            <el-tag v-else-if="row.reportCount >= 3" type="warning">{{
              row.reportCount
            }}</el-tag>
            <span v-else>{{ row.reportCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">已处理</el-tag>
            <el-tag v-else type="info">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="举报时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button
                type="primary"
                size="small"
                @click="handleReportAction(row.id)"
              >
                处理
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="rejectReportAction(row.id)"
              >
                驳回
              </el-button>
            </template>
            <template v-else>
              <el-tooltip :content="row.handleResult" placement="top">
                <span class="handler-info">{{ row.handlerName }}</span>
              </el-tooltip>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.report-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 18px;
    font-weight: 600;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.handler-info {
  font-size: 13px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
