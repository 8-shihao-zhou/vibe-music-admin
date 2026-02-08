<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { http } from "@/utils/http";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "NotificationManagement"
});

// 用户列表
const userList = ref([]);
const selectedUsers = ref([]);
const loading = ref(false);
const tableRef = ref(); // 添加表格引用

// 通知表单
const notificationForm = reactive({
  title: "",
  content: "",
  type: "SYSTEM",
  priority: "NORMAL"
});

const formRef = ref<FormInstance>();

// 通知类型选项
const typeOptions = [
  { label: "系统通知", value: "SYSTEM" },
  { label: "活动通知", value: "ACTIVITY" },
  { label: "个人消息", value: "PERSONAL" }
];

// 优先级选项
const priorityOptions = [
  { label: "普通", value: "NORMAL" },
  { label: "重要", value: "IMPORTANT" },
  { label: "紧急", value: "URGENT" }
];

// 表单验证规则
const rules = reactive<FormRules>({
  title: [
    { required: true, message: "请输入通知标题", trigger: "blur" },
    { min: 1, max: 200, message: "标题长度在 1 到 200 个字符", trigger: "blur" }
  ],
  content: [
    { required: true, message: "请输入通知内容", trigger: "blur" },
    {
      min: 1,
      max: 5000,
      message: "内容长度在 1 到 5000 个字符",
      trigger: "blur"
    }
  ],
  type: [{ required: true, message: "请选择通知类型", trigger: "change" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }]
});

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true;
    console.log("开始加载用户列表...");
    
    const response = await http.request("get", "/notification/admin/users");
    
    console.log("API响应:", response);
    console.log("响应码:", response.code);
    console.log("响应数据:", response.data);
    
    // 后端返回的code: 0表示成功，1表示失败
    if (response.code === 0) {
      // 只显示启用状态的用户
      const allUsers = response.data || [];
      userList.value = allUsers.filter(user => user.userStatus === '启用');
      
      console.log("用户列表加载成功，总数:", allUsers.length, "启用:", userList.value.length);
      
      if (userList.value.length === 0) {
        if (allUsers.length > 0) {
          message("提示：所有用户都已被禁用，无法发送通知", { 
            type: "warning",
            duration: 5000
          });
        } else {
          message("提示：当前系统中没有用户数据，请先在用户管理模块添加用户", { 
            type: "warning",
            duration: 5000
          });
        }
      }
    } else {
      console.error("加载失败，错误信息:", response.message || response.msg);
      message(response.message || response.msg || "加载用户列表失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("加载用户列表异常:", error);
    
    // 更详细的错误提示
    let errorMsg = "加载用户列表失败";
    if (error.response) {
      // 服务器返回了错误响应
      if (error.response.status === 401) {
        errorMsg = "登录已过期，请重新登录";
      } else if (error.response.status === 403) {
        errorMsg = "权限不足，请使用管理员账号登录";
      } else if (error.response.status === 500) {
        errorMsg = "服务器错误，请查看后端日志";
      } else {
        errorMsg = `请求失败 (${error.response.status})`;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMsg = "无法连接到服务器，请检查后端服务是否启动";
    } else {
      // 其他错误
      errorMsg = error.message || "加载用户列表失败";
    }
    
    message(errorMsg, { type: "error", duration: 5000 });
  } finally {
    loading.value = false;
  }
};

// 处理用户选择
const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection;
};

// 发送通知
const sendNotification = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      if (selectedUsers.value.length === 0) {
        message("请至少选择一个用户", { type: "warning" });
        return;
      }

      try {
        loading.value = true;
        const userIds = selectedUsers.value.map((user: any) => user.userId);

        const response = await http.request(
          "post",
          "/notification/admin/create",
          {
            data: {
              userIds: userIds,
              title: notificationForm.title,
              content: notificationForm.content,
              type: notificationForm.type,
              priority: notificationForm.priority
            }
          }
        );

        // 后端返回的code: 0表示成功，1表示失败
        if (response.code === 0) {
          message("通知发送成功", { type: "success" });
          // 重置表单
          formRef.value?.resetFields();
          selectedUsers.value = [];
          // 清空表格选择
          tableRef.value?.clearSelection();
        } else {
          message(response.message || response.msg || "通知发送失败", { type: "error" });
        }
      } catch (error) {
        console.error("发送通知失败:", error);
        message("通知发送失败", { type: "error" });
      } finally {
        loading.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  selectedUsers.value = [];
  // 清空表格选择
  tableRef.value?.clearSelection();
};

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "#f56c6c";
    case "IMPORTANT":
      return "#e6a23c";
    case "NORMAL":
    default:
      return "#909399";
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="notification-management">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">发送通知</span>
        </div>
      </template>

      <!-- 用户选择表格 -->
      <div class="mb-4">
        <div class="mb-2 text-sm text-gray-600">
          选择接收通知的用户（已选择 {{ selectedUsers.length }} 个用户）
        </div>
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="userList"
          style="width: 100%"
          max-height="400"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="userId" label="用户ID" width="100" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="email" label="邮箱" width="200" />
          <el-table-column prop="phone" label="手机号" width="150" />
          <el-table-column prop="createTime" label="注册时间" width="180" />
          <el-table-column prop="userStatus" label="状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.userStatus === '启用' ? 'success' : 'danger'"
              >
                {{ row.userStatus }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 通知表单 -->
      <el-form
        ref="formRef"
        :model="notificationForm"
        :rules="rules"
        label-width="100px"
        class="mt-6"
      >
        <el-form-item label="通知类型" prop="type">
          <el-select
            v-model="notificationForm.type"
            placeholder="请选择通知类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select
            v-model="notificationForm.priority"
            placeholder="请选择优先级"
            style="width: 100%"
          >
            <el-option
              v-for="item in priorityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span :style="{ color: getPriorityColor(item.value) }">
                {{ item.label }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="notificationForm.title"
            placeholder="请输入通知标题（最多200字符）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="notificationForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入通知内容（最多5000字符）"
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="sendNotification"
          >
            发送通知
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.notification-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  border-radius: 8px;
}
</style>
