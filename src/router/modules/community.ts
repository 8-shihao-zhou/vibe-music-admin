const Layout = () => import("@/layout/index.vue");

export default {
  path: "/community",
  name: "Community",
  component: Layout,
  redirect: "/community/index",
  meta: {
    icon: "ri:chat-3-line",
    title: "社区管理",
    rank: 8
  },
  children: [
    {
      path: "/community/index",
      name: "CommunityManagement",
      component: () => import("@/views/community/index.vue"),
      meta: {
        title: "社区概览"
      }
    },
    {
      path: "/community/posts",
      name: "CommunityPostManagement",
      component: () => import("@/views/community/posts.vue"),
      meta: {
        title: "帖子管理"
      }
    },
    {
      path: "/community/comments",
      name: "CommunityCommentManagement",
      component: () => import("@/views/community/comments.vue"),
      meta: {
        title: "评论管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
