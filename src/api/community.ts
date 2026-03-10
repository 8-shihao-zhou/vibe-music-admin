import { http } from "@/utils/http";
import type { Result } from "@/api/system";
import { getToken } from "@/utils/auth";

/** 社区管理相关接口 */

/** 获取社区统计数据 */
export const getCommunityStatistics = () => {
  const userData = getToken();
  return http.request<Result>("get", "/community/post/admin/statistics", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    }
  });
};

/** 分页查询所有帖子 */
export const getAdminPostList = (data: {
  category?: string;
  keyword?: string;
  status?: number;
  userId?: number;
  pageNum?: number;
  pageSize?: number;
}) => {
  const userData = getToken();
  return http.request<Result>("post", "/community/post/admin/list", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

/** 删除帖子 */
export const adminDeletePost = (postId: number, permanent: boolean = false) => {
  const userData = getToken();
  return http.request<Result>(
    "delete",
    `/community/post/admin/delete/${postId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: userData.accessToken
      },
      params: { permanent }
    }
  );
};

/** 批量删除帖子 */
export const adminBatchDeletePosts = (
  postIds: number[],
  permanent: boolean = false
) => {
  const userData = getToken();
  return http.request<Result>("post", "/community/post/admin/batch-delete", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data: postIds,
    params: { permanent }
  });
};

/** 置顶/取消置顶帖子 */
export const adminToggleTop = (postId: number, isTop: number) => {
  const userData = getToken();
  return http.request<Result>("put", `/community/post/admin/top/${postId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params: { isTop }
  });
};

/** 设置/取消热门帖子 */
export const adminToggleHot = (postId: number, isHot: number) => {
  const userData = getToken();
  return http.request<Result>("put", `/community/post/admin/hot/${postId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params: { isHot }
  });
};

/** 查询所有评论 */
export const getAdminComments = (
  pageNum: number = 1,
  pageSize: number = 10,
  keyword?: string
) => {
  const userData = getToken();
  return http.request<Result>("get", "/community/post/admin/comments", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params: { pageNum, pageSize, keyword }
  });
};

/** 删除评论 */
export const adminDeleteComment = (commentId: number) => {
  const userData = getToken();
  return http.request<Result>(
    "delete",
    `/community/post/admin/comment/${commentId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: userData.accessToken
      }
    }
  );
};
