import "./reset.css";
import dayjs from "dayjs";
import editForm from "../form/index.vue";
import { message } from "@/utils/message";
import songCover from "@/assets/song.jpg";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps } from "../utils/types";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import {
  getAllArtists,
  getSongList,
  addSong,
  updateSong,
  updateSongCover,
  deleteSong,
  deleteSongs
} from "@/api/system";
import {
  type Ref,
  h,
  ref,
  toRaw,
  watch,
  computed,
  reactive,
  onMounted
} from "vue";

export function useSong(tableRef: Ref) {
  const form = reactive({
    pageNum: 1,
    pageSize: 10,
    songName: null,
    album: null
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传封面信息
  const coverInfo = ref();
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "歌曲编号",
      prop: "songId",
      width: 90
    },
    {
      label: "封面",
      prop: "cover",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.cover || songCover}
          preview-src-list={Array.of(row.cover || songCover)}
          class="w-[72px] h-[72px] rounded-lg align-middle"
        />
      ),
      width: 90
    },
    {
      label: "歌名",
      prop: "songName",
      minWidth: 130,
      showOverflowTooltip: false
    },
    {
      label: "歌手",
      prop: "artistName",
      minWidth: 160,
      showOverflowTooltip: false
    },
    {
      label: "专辑",
      prop: "album",
      minWidth: 160,
      width: 200,
      showOverflowTooltip: false
    },
    {
      label: "曲风",
      prop: "style",
      minWidth: 130,
      cellRenderer: ({ row }) =>
        row.style && Array.isArray(row.style)
          ? row.style.map((tag, index) => (
              <el-tag key={index} class="mr-1">
                {tag}
              </el-tag>
            ))
          : "-"
    },
    {
      label: "发行日期",
      minWidth: 130,
      width: 130,
      prop: "releaseTime",
      formatter: ({ releaseTime }) => dayjs(releaseTime).format("YYYY-MM-DD")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });

  function handleUpdate(row) {
    console.log(row);
  }

  function handleDelete(row) {
    deleteSong(row.songId).then(res => {
      if (res.code === 0) {
        message(`您删除了歌曲编号为 ${row.songId} 的这条数据`, {
          type: "success"
        });
        onSearch();
      } else {
        message("删除歌曲失败", { type: "error" });
      }
    });
  }

  function handleSizeChange(val: number) {
    // console.log(`${val} items per page`);
    pagination.pageSize = val; // 更新每页条目数
    form.pageSize = val; // 更新页码参数
    onSearch(); // 重新获取数据
  }

  function handleCurrentChange(val: number) {
    // console.log(`current page: ${val}`);
    pagination.currentPage = val; // 更新当前页码
    form.pageNum = val; // 更新页码参数
    onSearch(); // 重新获取数据
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空歌曲的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    const ids = getKeyList(curSelected, "songId");

    deleteSongs(ids)
      .then(res => {
        if (res.code === 0) {
          message(`已删除歌曲编号为 ${ids} 的数据`, {
            type: "success"
          });
          tableRef.value.getTableRef().clearSelection();
          onSearch();
        } else {
          message("删除歌曲失败", { type: "error" });
        }
      })
      .catch(err => {
        console.error("删除歌曲失败", err);
        message("删除歌曲失败", { type: "error" });
      });
  }

  async function onSearch() {
    try {
      const result = await getSongList(toRaw(form)); // 获取完整的返回数据

      if (result.code === 0 && result.data && result.data.items) {
        // 如果返回状态码为 0（成功），且 data 和 items 存在
        pagination.total = result.data.total; // 设置总条目数
        dataList.value = result.data.items.map(item => ({
          songId: item.songId,
          artistId: item.artistId, // 添加 artistId
          songName: item.songName,
          artistName: item.artistName,
          album: item.album,
          cover: item.coverUrl,
          audio: item.audioUrl,
          style: item.style ? item.style.split(",") : [],
          releaseTime: item.releaseTime
        }));
      } else {
        // 如果返回状态码不为 0 或 data.items 不存在
        dataList.value = [];
        pagination.total = 0;
        message("未找到匹配的歌手信息", { type: "warning" });
      }
    } catch (error) {
      console.error("请求失败：", error);
      message("请求失败，请稍后重试", { type: "error" });
    }

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  /** 监听歌手变化，重新加载歌曲列表 */
  watch(
    () => form.artistId,
    newId => {
      if (newId) {
        onSearch();
      }
    }
  );

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    form.artistId = "";
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}歌曲`,
      props: {
        formInline: {
          title,
          artistId: row?.artistId ?? null,
          artistName: row?.artistName ?? "",
          songId: row?.songId ?? 0,
          songName: row?.songName ?? "",
          album: row?.album ?? "",
          style: row?.style ?? [],
          releaseTime: row?.releaseTime ?? ""
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了歌名为 ${curData.songName} 的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);

            // 检查 artistId 是否有效
            if (!curData.artistId || curData.artistId === 0) {
              message("请选择歌手", { type: "error" });
              return;
            }

            // 表单规则校验通过
            if (title === "新增") {
              curData.style = Array.isArray(curData.style)
                ? curData.style.join(",")
                : "";

              try {
                const res = await addSong(curData);
                if (res.code === 0) {
                  chores();
                } else {
                  message("新增歌曲失败，" + res.message, { type: "error" });
                }
              } catch (error) {
                console.error("添加歌曲失败:", error);
                message("添加歌曲失败，请检查网络连接", { type: "error" });
              }
            } else {
              curData.style = Array.isArray(curData.style)
                ? curData.style.join(",")
                : "";
              updateSong(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("修改歌曲失败，" + res.message, { type: "error" });
                }
              });
            }
          }
        });
      }
    });
  }

  const cropRef = ref();
  /** 上传封面 */
  async function handleUpload(row) {
    addDialog({
      title: "裁剪、上传封面",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.cover || songCover,
          onCropper: info => (coverInfo.value = info)
        }),
      beforeSure: async done => {
        if (!coverInfo.value?.blob) {
          message("图片裁剪失败，请重试", { type: "error" });
          return;
        }

        // 创建 FormData
        const formData = new FormData();
        formData.append("cover", coverInfo.value.blob); // 使用 blob 数据
        formData.append("songId", row.songId); // 传递歌手 ID

        try {
          // 调用上传接口
          const res = await updateSongCover(row.songId, formData);

          if (res.code === 0) {
            message("上传封面成功", { type: "success" });
            done(); // 关闭弹框
            onSearch(); // 刷新表格数据
          } else {
            message("上传封面失败", { type: "error" });
          }
        } catch (error) {
          console.error("上传失败:", error);
          message("上传失败，请重试", { type: "error" });
        }
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  onMounted(async () => {
    await onSearch(); // 获取歌曲列表
  });

  return {
    form,
    loading,
    columns,
    dataList,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
