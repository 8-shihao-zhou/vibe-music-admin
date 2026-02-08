export default {
  path: "/notification",
  redirect: "/notification/index",
  meta: {
    icon: "ri:notification-3-line",
    title: "通知管理",
    rank: 7
  },
  children: [
    {
      path: "/notification/index",
      name: "NotificationManagement",
      component: () => import("@/views/notification/index.vue"),
      meta: {
        title: "发送通知"
      }
    },
    {
      path: "/notification/history",
      name: "NotificationHistory",
      component: () => import("@/views/notification/history.vue"),
      meta: {
        title: "通知历史"
      }
    }
  ]
} satisfies RouteConfigsTable;
