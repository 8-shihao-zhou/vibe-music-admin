<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import {
  getPlaylistSongs,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getSongList
} from "@/api/system";
import type { ResultTable } from "@/api/system";

const props = defineProps<{ playlistId: number; playlistTitle: string }>();

// 歌单内歌曲
const playlistSongs = ref<any[]>([]);
// 搜索歌曲
const searchKeyword = ref("");
const searchResults = ref<any[]>([]);
const searching = ref(false);

const loadPlaylistSongs = async () => {
  const res = await getPlaylistSongs(props.playlistId);
  if (res.code === 0) {
    playlistSongs.value = (res.data as any[]) || [];
  }
};

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return;
  searching.value = true;
  try {
    const res = (await getSongList({
      pageNum: 1,
      pageSize: 20,
      songName: searchKeyword.value,
      artistId: null,
      album: ""
    })) as ResultTable;
    if (res.code === 0 && res.data?.items) {
      searchResults.value = res.data.items;
    }
  } finally {
    searching.value = false;
  }
};

const handleAdd = async (song: any) => {
  // 兼容字段名 songId 或 id
  const id = song.songId ?? song.id;
  if (!id) {
    message("无法获取歌曲ID", { type: "error" });
    return;
  }
  const res = await addSongToPlaylist(props.playlistId, id);
  if (res.code === 0) {
    message("添加成功", { type: "success" });
    await loadPlaylistSongs();
  } else {
    message(res.message || "添加失败", { type: "error" });
  }
};

const handleRemove = async (song: any) => {
  const id = song.songId ?? song.id;
  if (!id) {
    message("无法获取歌曲ID", { type: "error" });
    return;
  }
  const res = await removeSongFromPlaylist(props.playlistId, id);
  if (res.code === 0) {
    message("已移除", { type: "success" });
    await loadPlaylistSongs();
  } else {
    message("移除失败", { type: "error" });
  }
};

const isInPlaylist = (song: any) => {
  const id = song.songId ?? song.id;
  if (!id) return false;
  return playlistSongs.value.some(s => {
    const sid = s.songId ?? s.id;
    return sid && sid === id;
  });
};

onMounted(loadPlaylistSongs);
</script>

<template>
  <div class="flex gap-4" style="min-height: 400px; padding-top: 16px">
    <!-- 左：歌单内歌曲 -->
    <div style="width: 300px; flex-shrink: 0" class="flex flex-col">
      <div class="font-semibold mb-2 text-sm">
        歌单内歌曲（{{ playlistSongs.length }} 首）
      </div>
      <el-scrollbar height="360px">
        <div
          v-if="playlistSongs.length === 0"
          class="text-center text-gray-400 py-8 text-sm"
        >
          暂无歌曲，从右侧搜索添加
        </div>
        <!-- 固定宽度容器，超出横向滚动 -->
        <div style="min-width: 400px">
          <div
            v-for="song in playlistSongs"
            :key="song.songId ?? song.id"
            class="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            style="gap: 8px"
          >
            <el-image
              v-if="song.coverUrl"
              :src="song.coverUrl"
              fit="cover"
              style="
                width: 32px;
                height: 32px;
                border-radius: 4px;
                flex-shrink: 0;
              "
            />
            <div
              v-else
              style="
                width: 32px;
                height: 32px;
                flex-shrink: 0;
                background: #f0f0f0;
                border-radius: 4px;
              "
            />
            <!-- 歌曲信息，固定宽度截断 -->
            <div style="width: 260px; min-width: 0">
              <div class="text-sm font-medium truncate">
                {{ song.songName }}
              </div>
              <div class="text-xs text-gray-400 truncate">{{ song.album }}</div>
            </div>
            <!-- 按钮固定不缩 -->
            <el-button
              type="danger"
              link
              size="small"
              style="flex-shrink: 0; margin-left: auto"
              @click="handleRemove(song)"
              >移除</el-button
            >
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
        <div
          v-if="searchResults.length === 0"
          class="text-center text-gray-400 py-8 text-sm"
        >
          输入关键词搜索歌曲
        </div>
        <!-- 固定宽度容器，超出横向滚动 -->
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
              style="
                width: 32px;
                height: 32px;
                border-radius: 4px;
                flex-shrink: 0;
              "
            />
            <div
              v-else
              style="
                width: 32px;
                height: 32px;
                flex-shrink: 0;
                background: #f0f0f0;
                border-radius: 4px;
              "
            />
            <!-- 歌曲信息，固定宽度截断 -->
            <div style="width: 320px; min-width: 0">
              <div class="text-sm font-medium truncate">
                {{ song.songName }}
              </div>
              <div class="text-xs text-gray-400 truncate">
                {{ song.artistName }}
              </div>
            </div>
            <!-- 按钮固定右边，不被挤压 -->
            <el-button
              type="primary"
              link
              size="small"
              style="flex-shrink: 0; margin-left: auto; min-width: 48px"
              :disabled="isInPlaylist(song)"
              @click="handleAdd(song)"
              >{{ isInPlaylist(song) ? "已添加" : "添加" }}</el-button
            >
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
