export default {
  path: "/song",
  redirect: "/song/index",
  meta: {
    icon: "ri:music-2-fill",
    title: "歌曲管理",
    rank: 3
  },
  children: [
    {
      path: "/song/index",
      name: "SongManagement",
      component: () => import("@/views/song/index.vue"),
      meta: {
        title: "歌曲管理"
      }
    },
    {
      path: "/song/comments",
      name: "SongCommentManagement",
      component: () => import("@/views/comment/manage.vue"),
      meta: {
        title: "歌曲评论管理",
        commentType: 0
      }
    }
  ]
} satisfies RouteConfigsTable;
