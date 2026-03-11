const Layout = () => import("@/layout/index.vue");

export default {
  path: "/report",
  name: "Report",
  component: Layout,
  redirect: "/report/index",
  meta: {
    icon: "ri:alarm-warning-line",
    title: "举报管理",
    rank: 9
  },
  children: [
    {
      path: "/report/index",
      name: "ReportManagement",
      component: () => import("@/views/report/index.vue"),
      meta: {
        title: "举报列表"
      }
    }
  ]
} satisfies RouteConfigsTable;
