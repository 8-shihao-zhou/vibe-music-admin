export default {
  path: "/song-request",
  redirect: "/song-request/index",
  meta: {
    icon: "ri:music-ai-fill",
    title: "收录申请",
    rank: 4
  },
  children: [
    {
      path: "/song-request/index",
      name: "SongRequestManagement",
      component: () => import("@/views/song-request/index.vue"),
      meta: {
        title: "收录申请"
      }
    }
  ]
} satisfies RouteConfigsTable;
