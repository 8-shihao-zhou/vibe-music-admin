import { http } from "@/utils/http";
import type { Result } from "@/api/system";
import { getToken } from "@/utils/auth";

/** 获取歌曲/歌单评论管理列表 */
export const getAdminCommentList = (params: {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  type?: number;
}) => {
  const userData = getToken();
  return http.request<Result>("get", "/comment/admin/list", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params
  });
};

/** 管理端删除歌曲/歌单评论 */
export const adminDeleteComment = (commentId: number) => {
  const userData = getToken();
  return http.request<Result>("delete", `/comment/admin/${commentId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    }
  });
};
