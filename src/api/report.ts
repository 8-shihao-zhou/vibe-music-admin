import { http } from "@/utils/http";
import type { Result } from "@/api/system";
import { getToken } from "@/utils/auth";

/** 举报管理相关接口 */

/** 获取举报列表 */
export const getReportList = (params: {
  pageNum?: number;
  pageSize?: number;
  status?: number;
  targetType?: number;
}) => {
  const userData = getToken();
  return http.request<Result>("get", "/report/admin/list", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params
  });
};

/** 处理举报 */
export const handleReport = (reportId: number, handleResult: string) => {
  const userData = getToken();
  return http.request<Result>("post", `/report/admin/handle/${reportId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params: { handleResult }
  });
};

/** 驳回举报 */
export const rejectReport = (reportId: number, handleResult: string) => {
  const userData = getToken();
  return http.request<Result>("post", `/report/admin/reject/${reportId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params: { handleResult }
  });
};

/** 重置举报数据 */
export const resetReportData = () => {
  const userData = getToken();
  return http.request<Result>("delete", "/report/admin/reset", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    }
  });
};
