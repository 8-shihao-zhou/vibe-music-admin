<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getSongRequestList, approveSongRequest, rejectSongRequest, deleteSongRequests } from "@/api/system";

defineOptions({ name: "SongRequestManagement" });

const loading = ref(false);
const dataList = ref<any[]>([]);
const total = ref(0);
const rejectDialogVisible = ref(false);
const rejectReason = ref("");
const rejectingId = ref<number | null>(null);
const selectedIds = ref<number[]>([]);
const tableRef = ref();

const form = reactive({
  status: "" as number | string,
  keyword: "",
  pageNum: 1,
  pageSize: 10,
});

const statusOptions = [
  { label: "全部", value: "" },
  { label: "待审核", value: 0 },
  { label: "已通过", value: 1 },
  { label: "已拒绝", value: 2 },
];

const statusTagType = (status: number) => {
  if (status === 0) return "warning";
  if (status === 1) return "success";
  return "danger";
};

const statusText = (status: number) => {
  if (status === 0) return "待审核";
  if (status === 1) return "已通过";
  return "已拒绝";
};

const onSearch = async () => {
  loading.value = true;
  try {
    const res = await getSongRequestList({
      ...form,
      status: form.status === "" ? undefined : Number(form.status)
    });
    console.log("[收录申请] 列表完整响应:", JSON.stringify(res));
    // 兼容多种响应结构
    const code = (res as any)?.code;
    const data = (res as any)?.data;
    if (code === 0 && data) {
      dataList.value = data.records || data.items || data.list || [];
      total.value = data.total || 0;
      console.log("[收录申请] 数据条数:", dataList.value.length, "总数:", total.value);
    } else {
      console.warn("[收录申请] 响应异常，code:", code, "data:", data);
      dataList.value = [];
      total.value = 0;
    }
  } catch (e) {
    console.error("[收录申请] 请求异常:", e);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.status = "";
  form.keyword = "";
  form.pageNum = 1;
  onSearch();
};

const handleSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map(r => r.id);
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请先选择要删除的记录");
    return;
  }
  await ElMessageBox.confirm(
    `确认删除选中的 ${selectedIds.value.length} 条记录？`,
    "确认删除",
    { type: "warning" }
  );
  console.log("[收录申请] 批量删除IDs:", selectedIds.value);
  const res = await deleteSongRequests(selectedIds.value);
  if (res.code === 0) {
    ElMessage.success("删除成功");
    selectedIds.value = [];
    onSearch();
  } else {
    ElMessage.error(res.message || "删除失败");
  }
};

const handleApprove = async (row: any) => {
  await ElMessageBox.confirm(
    `确认通过《${row.songName}》的收录申请？通过后将自动导入歌曲库。`,
    "确认通过",
    { type: "warning" }
  );
  console.log("[收录申请] 审核通过，id:", row.id);
  const res = await approveSongRequest(row.id);
  console.log("[收录申请] 审核通过响应:", res);
  if (res.code === 0) {
    ElMessage.success("已通过，已通知用户");
    onSearch();
  } else {
    ElMessage.error(res.message || "操作失败");
  }
};

const openRejectDialog = (row: any) => {
  rejectingId.value = row.id;
  rejectReason.value = "";
  rejectDialogVisible.value = true;
};

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning("请填写拒绝原因");
    return;
  }
  const res = await rejectSongRequest(rejectingId.value!, rejectReason.value);
  if (res.code === 0) {
    ElMessage.success("已拒绝，已通知用户");
    rejectDialogVisible.value = false;
    onSearch();
  } else {
    ElMessage.error(res.message || "操作失败");
  }
};

onMounted(onSearch);
</script>

<template>
  <div class="p-4">
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="form" class="mb-3">
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="全部" style="width: 120px" clearable>
          <el-option v-for="opt in statusOptions" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="form.keyword" placeholder="歌名/歌手" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSearch">搜索</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          删除选中 {{ selectedIds.length > 0 ? `(${selectedIds.length})` : '' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table ref="tableRef" v-loading="loading" :data="dataList" border stripe
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="45" />
      <el-table-column prop="id" label="ID" width="65" />
      <el-table-column label="封面" width="70">
        <template #default="{ row }">
          <template v-if="row.coverUrl">
            <el-image
              :src="row.coverUrl"
              fit="cover"
              preview-teleported
              :preview-src-list="[row.coverUrl]"
              style="width: 48px; height: 48px; border-radius: 6px; cursor: pointer"
            >
              <template #error>
                <div style="width:48px;height:48px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;border-radius:6px">
                  加载失败
                </div>
              </template>
            </el-image>
          </template>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="songName" label="歌曲名" min-width="110" show-overflow-tooltip />
      <el-table-column prop="artistName" label="歌手" min-width="90" show-overflow-tooltip />
      <el-table-column prop="album" label="专辑" min-width="90" show-overflow-tooltip />
      <el-table-column prop="style" label="曲风" width="90" show-overflow-tooltip />
      <el-table-column prop="releaseTime" label="发行日期" width="105" />
      <el-table-column prop="username" label="提交用户" width="95" />
      <el-table-column label="版权说明" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.licenseDesc }}</template>
      </el-table-column>
      <el-table-column label="音频" width="90">
        <template #default="{ row }">
          <template v-if="row.audioUrl">
            <a :href="row.audioUrl" target="_blank" rel="noopener noreferrer"
              style="color: var(--el-color-primary); font-size: 13px; text-decoration: none"
              @click.stop>
              试听
            </a>
          </template>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="85">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="rejectReason" label="拒绝原因" min-width="110" show-overflow-tooltip />
      <el-table-column prop="createTime" label="提交时间" width="155" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 0">
            <el-button link type="success" size="small" @click="handleApprove(row)">通过</el-button>
            <el-button link type="danger" size="small" @click="openRejectDialog(row)">拒绝</el-button>
          </template>
          <span v-else class="text-gray-400 text-sm">已处理</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-end mt-3">
      <el-pagination
        v-model:current-page="form.pageNum"
        v-model:page-size="form.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        background
        @size-change="onSearch"
        @current-change="onSearch"
      />
    </div>

    <!-- 拒绝原因弹窗 -->
    <el-dialog v-model="rejectDialogVisible" title="填写拒绝原因" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请填写拒绝原因，将通知给用户" />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>
