<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { getSongList, updateSong, deleteSong } from "@/api/system";
import type { ResultTable } from "@/api/system";

const props = defineProps<{ artistId: number; artistName: string }>();

// 歌手下的歌曲
const artistSongs = ref<any[]>([]);
const loadingArtist = ref(false);
// 搜索
const searchKeyword = ref("");
const searchResults = ref<any[]>([]);
const searching = ref(false);

const loadArtistSongs = async () => {
  loadingArtist.value = true;
  try {
    const res = await getSongList({
      pageNum: 1,
      pageSize: 200,
      songName: "",
      artistId: props.artistId,
      album: ""
    }) as ResultTable;
    if (res.code === 0 && res.data?.items) {
      artistSongs.value = res.data.items;
    }
  } finally {
    loadingArtist.value = false;
  }
};

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return;
  searching.value = true;
  try {
    const res = await getSongList({
      pageNum: 1,
      pageSize: 20,
      songName: searchKeyword.value,
      artistId: null,
      album: ""
    }) as ResultTable;
    if (res.code === 0 && res.data?.items) {
      // 过滤掉已属于该歌手的歌曲
      searchResults.value = res.data.items;
    }
  } finally {
    searching.value = false;
  }
};

/** 将歌曲归属到该歌手（更新 artistId） */
const handleAdd = async (song: any) => {
  const id = song.songId ?? song.id;
  if (!id) { message("无法获取歌曲ID", { type: "error" }); return; }
  const res = await updateSong({
    songId: id,
    artistId: props.artistId,
    songName: song.songName,
    album: song.album,
    style: song.style,
    lyric: song.lyric,
    releaseTime: song.releaseTime,
    duration: song.duration
  });
  if (res.code === 0) {
    message("添加成功", { type: "success" });
    await loadArtistSongs();
  } else {
    message(res.message || "添加失败", { type: "error" });
  }
};

/** 删除歌曲 */
const handleRemove = async (song: any) => {
  const id = song.songId ?? song.id;
  if (!id) { message("无法获取歌曲ID", { type: "error" }); return; }
  const res = await deleteSong(id);
  if (res.code === 0) {
    message("已删除", { type: "success" });
    await loadArtistSongs();
  } else {
    message(res.message || "删除失败", { type: "error" });
  }
};

const isInArtist = (song: any) => {
  const id = song.songId ?? song.id;
  if (!id) return false;
  return artistSongs.value.some(s => {
    const sid = s.songId ?? s.id;
    return sid && sid === id;
  });
};

onMounted(loadArtistSongs);
</script>

<template>
  <div class="flex gap-4" style="min-height: 400px; padding-top: 16px">
    <!-- 左：歌手下的歌曲 -->
    <div style="width: 300px; flex-shrink: 0" class="flex flex-col">
      <div class="font-semibold mb-2 text-sm">
        歌手歌曲（{{ artistSongs.length }} 首）
      </div>
      <el-scrollbar height="360px" v-loading="loadingArtist">
        <div v-if="artistSongs.length === 0" class="text-center text-gray-400 py-8 text-sm">
          暂无歌曲，从右侧搜索添加
        </div>
        <div style="min-width: 400px">
          <div
            v-for="song in artistSongs"
            :key="song.songId ?? song.id"
            class="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            style="gap: 8px"
          >
            <el-image
              v-if="song.coverUrl"
              :src="song.coverUrl"
              fit="cover"
              style="width:32px;height:32px;border-radius:4px;flex-shrink:0"
            />
            <div v-else style="width:32px;height:32px;flex-shrink:0;background:#f0f0f0;border-radius:4px" />
            <div style="width: 260px; min-width: 0">
              <div class="text-sm font-medium truncate">{{ song.songName }}</div>
              <div class="text-xs text-gray-400 truncate">{{ song.album }}</div>
            </div>
            <el-popconfirm
              title="确认删除该歌曲？"
              confirm-button-text="删除"
              confirm-button-type="danger"
              cancel-button-text="取消"
              @confirm="handleRemove(song)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  link
                  size="small"
                  style="flex-shrink:0;margin-left:auto"
                >删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <el-divider direction="vertical" style="height: auto; margin: 0 16px" />

    <!-- 右：搜索添加 -->
    <div class="flex-1 flex flex-col" style="min-width: 0">
      <div class="font-semibold mb-2 text-sm">搜索歌曲</div>
      <div class="flex gap-2 mb-3">
        <el-input
          v-model="searchKeyword"
          placeholder="输入歌曲名称"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" :loading="searching" @click="handleSearch">
          搜索
        </el-button>
      </div>
      <el-scrollbar height="320px">
        <div v-if="searchResults.length === 0" class="text-center text-gray-400 py-8 text-sm">
          输入关键词搜索歌曲
        </div>
        <div style="min-width: 480px">
          <div
            v-for="song in searchResults"
            :key="song.songId ?? song.id"
            class="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            style="gap: 8px"
          >
            <el-image
              v-if="song.coverUrl"
              :src="song.coverUrl"
              fit="cover"
              style="width:32px;height:32px;border-radius:4px;flex-shrink:0"
            />
            <div v-else style="width:32px;height:32px;flex-shrink:0;background:#f0f0f0;border-radius:4px" />
            <div style="width: 320px; min-width: 0">
              <div class="text-sm font-medium truncate">{{ song.songName }}</div>
              <div class="text-xs text-gray-400 truncate">{{ song.artistName }}</div>
            </div>
            <el-button
              type="primary"
              link
              size="small"
              style="flex-shrink:0;margin-left:auto;min-width:48px"
              :disabled="isInArtist(song)"
              @click="handleAdd(song)"
            >{{ isInArtist(song) ? '已添加' : '添加' }}</el-button>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
