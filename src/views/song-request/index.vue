<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getSongRequestList,
  approveSongRequest,
  rejectSongRequest
} from "@/api/system";
import AudioPreview from "../song/form/preview.vue";

defineOptions({ name: "SongRequestManagement" });

const loading = ref(false);
const dataList = ref<any[]>([]);
const total = ref(0);
const rejectDialogVisible = ref(false);
const rejectReason = ref("");
const rejectingId = ref<number | null>(null);

// 音频预览相关
const showPreviewDialog = ref(false);
const selectedSongName = ref("");
const selectedAudioUrl = ref("");

const openAudioPreview = (row: any) => {
  selectedSongName.value = row.songName;
  selectedAudioUrl.value = row.audioUrl;
  showPreviewDialog.value = true;
};

const form = reactive({
  status: null as number | null,
  keyword: "",
  pageNum: 1,
  pageSize: 10
});

const statusOptions = [
  { label: "全部", value: null },
  { label: "待审核", value: 0 },
  { label: "已通过", value: 1 },
  { label: "已拒绝", value: 2 }
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
    const res = await getSongRequestList(form);
    if (res.code === 0 && res.data) {
      const data = res.data as any;
      dataList.value = data.records || [];
      total.value = data.total || 0;
    }
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.status = null;
  form.keyword = "";
  form.pageNum = 1;
  onSearch();
};

const handleApprove = async (row: any) => {
  await ElMessageBox.confirm(
    `确认通过《${row.songName}》的收录申请？通过后将自动导入歌曲库。`,
    "确认通过",
    { type: "warning" }
  );
  const res = await approveSongRequest(row.id);
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
    <el-form :inline="true" :model="form" class="mb-4">
      <el-form-item label="状态">
        <el-select
          v-model="form.status"
          placeholder="全部"
          style="width: 120px"
          clearable
        >
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input
          v-model="form.keyword"
          placeholder="歌名/歌手"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSearch"
          >搜索</el-button
        >
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="封面" width="70">
        <template #default="{ row }">
          <el-image
            v-if="row.coverUrl"
            :src="row.coverUrl"
            fit="cover"
            preview-teleported
            :preview-src-list="[row.coverUrl]"
            style="width: 48px; height: 48px; border-radius: 6px"
          />
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="songName"
        label="歌曲名"
        min-width="120"
        show-overflow-tooltip
      />
      <el-table-column
        prop="artistName"
        label="歌手"
        min-width="100"
        show-overflow-tooltip
      />
      <el-table-column
        prop="album"
        label="专辑"
        min-width="100"
        show-overflow-tooltip
      />
      <el-table-column
        prop="style"
        label="曲风"
        width="100"
        show-overflow-tooltip
      />
      <el-table-column prop="releaseTime" label="发行日期" width="110" />
      <el-table-column prop="username" label="提交用户" width="100" />
      <el-table-column label="版权说明" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">{{ row.licenseDesc }}</template>
      </el-table-column>
      <el-table-column label="音频" width="80">
        <template #default="{ row }">
          <el-button
            v-if="row.audioUrl"
            link
            type="primary"
            size="small"
            @click="openAudioPreview(row)"
          >
            试听
          </el-button>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="rejectReason"
        label="拒绝原因"
        min-width="120"
        show-overflow-tooltip
      />
      <el-table-column prop="createTime" label="提交时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 0">
            <el-button
              link
              type="success"
              size="small"
              @click="handleApprove(row)"
              >通过</el-button
            >
            <el-button
              link
              type="danger"
              size="small"
              @click="openRejectDialog(row)"
              >拒绝</el-button
            >
          </template>
          <span v-else class="text-gray-400 text-sm">已处理</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-end mt-4">
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
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请填写拒绝原因，将通知给用户"
      />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 音频预览弹窗 -->
    <AudioPreview
      v-model:visible="showPreviewDialog"
      :song-name="selectedSongName"
      :audio-url="selectedAudioUrl"
    />
  </div>
</template>
