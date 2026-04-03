<script setup lang="ts">
import {
  ref,
  unref,
  watch,
  reactive,
  computed,
  nextTick,
  onUnmounted,
  onBeforeMount
} from "vue";
import { emitter } from "@/utils/mitt";
import LayPanel from "../lay-panel/index.vue";
import { useNav } from "@/layout/hooks/useNav";
import { useAppStoreHook } from "@/store/modules/app";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import Segmented, { type OptionsType } from "@/components/ReSegmented";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { useDark, useGlobal, debounce, isNumber } from "@pureadmin/utils";
import LeftArrow from "@iconify-icons/ri/arrow-left-s-line";
import RightArrow from "@iconify-icons/ri/arrow-right-s-line";
import DayIcon from "@/assets/svg/day.svg?component";
import DarkIcon from "@/assets/svg/dark.svg?component";
import SystemIcon from "@/assets/svg/system.svg?component";

const { device } = useNav();
const { isDark } = useDark();
const { $storage } = useGlobal<GlobalPropertiesApi>();

const mixRef = ref();
const verticalRef = ref();
const horizontalRef = ref();

const { dataTheme, overallStyle, layoutTheme, toggleClass, dataThemeChange } =
  useDataThemeChange();

if (unref(layoutTheme)) {
  const layout = unref(layoutTheme).layout;
  const theme = unref(layoutTheme).theme;
  document.documentElement.setAttribute("data-theme", theme);
  setLayoutModel(layout);
}

const logoVal = ref($storage.configure?.showLogo ?? true);

const settings = reactive({
  greyVal: $storage.configure.grey,
  weakVal: $storage.configure.weak,
  tabsVal: $storage.configure.hideTabs,
  hideFooter: $storage.configure.hideFooter,
  multiTagsCache: $storage.configure.multiTagsCache,
  stretch: $storage.configure.stretch
});

function storageConfigureChange<T>(key: string, val: T): void {
  const storageConfigure = $storage.configure;
  storageConfigure[key] = val;
  $storage.configure = storageConfigure;
}

const greyChange = (value): void => {
  const htmlEl = document.querySelector("html");
  toggleClass(settings.greyVal, "html-grey", htmlEl);
  storageConfigureChange("grey", value);
};

const weekChange = (value): void => {
  const htmlEl = document.querySelector("html");
  toggleClass(settings.weakVal, "html-weakness", htmlEl);
  storageConfigureChange("weak", value);
};

const tagsChange = () => {
  const showVal = settings.tabsVal;
  storageConfigureChange("hideTabs", showVal);
  emitter.emit("tagViewsChange", showVal as unknown as string);
};

const hideFooterChange = () => {
  const hideFooter = settings.hideFooter;
  storageConfigureChange("hideFooter", hideFooter);
};

const multiTagsCacheChange = () => {
  const multiTagsCache = settings.multiTagsCache;
  storageConfigureChange("multiTagsCache", multiTagsCache);
  useMultiTagsStoreHook().multiTagsCacheChange(multiTagsCache);
};

function logoChange() {
  unref(logoVal)
    ? storageConfigureChange("showLogo", true)
    : storageConfigureChange("showLogo", false);
  emitter.emit("logoChange", unref(logoVal));
}

function setFalse(domRefs): void {
  domRefs.forEach(item => {
    toggleClass(false, "is-select", unref(item));
  });
}

const stretchTypeOptions = computed<Array<OptionsType>>(() => [
  {
    label: "固定",
    tip: "使用常规页面宽度",
    value: "fixed"
  },
  {
    label: "自定义",
    tip: "可在 1280 到 1600 之间调整",
    value: "custom"
  }
]);

const setStretch = value => {
  settings.stretch = value;
  storageConfigureChange("stretch", value);
};

const stretchTypeChange = ({ option }) => {
  const { value } = option;
  value === "custom" ? setStretch(1440) : setStretch(false);
};

const pClass = computed(() => [
  "mb-[12px]",
  "font-medium",
  "text-sm",
  "dark:text-white"
]);

const themeOptions = computed<Array<OptionsType>>(() => [
  {
    label: "浅色",
    icon: DayIcon,
    theme: "light",
    tip: "清爽明亮，适合日常管理",
    iconAttrs: { fill: isDark.value ? "#fff" : "#000" }
  },
  {
    label: "深色",
    icon: DarkIcon,
    theme: "dark",
    tip: "沉稳柔和，适合低亮环境",
    iconAttrs: { fill: isDark.value ? "#fff" : "#000" }
  },
  {
    label: "自动",
    icon: SystemIcon,
    theme: "system",
    tip: "跟随系统主题自动切换",
    iconAttrs: { fill: isDark.value ? "#fff" : "#000" }
  }
]);

function setLayoutModel(layout: string) {
  layoutTheme.value.layout = layout;
  window.document.body.setAttribute("layout", layout);
  $storage.layout = {
    layout,
    theme: layoutTheme.value.theme,
    darkMode: $storage.layout?.darkMode,
    sidebarStatus: $storage.layout?.sidebarStatus,
    epThemeColor: $storage.layout?.epThemeColor,
    themeColor: $storage.layout?.themeColor,
    overallStyle: $storage.layout?.overallStyle
  };
  useAppStoreHook().setLayout(layout);
}

watch($storage, ({ layout }) => {
  switch (layout["layout"]) {
    case "vertical":
      toggleClass(true, "is-select", unref(verticalRef));
      debounce(setFalse([horizontalRef]), 50);
      debounce(setFalse([mixRef]), 50);
      break;
    case "horizontal":
      toggleClass(true, "is-select", unref(horizontalRef));
      debounce(setFalse([verticalRef]), 50);
      debounce(setFalse([mixRef]), 50);
      break;
    case "mix":
      toggleClass(true, "is-select", unref(mixRef));
      debounce(setFalse([verticalRef]), 50);
      debounce(setFalse([horizontalRef]), 50);
      break;
  }
});

const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

function updateTheme() {
  if (overallStyle.value !== "system") return;
  dataTheme.value = mediaQueryList.matches;
  dataThemeChange(overallStyle.value);
}

function removeMatchMedia() {
  mediaQueryList.removeEventListener("change", updateTheme);
}

function watchSystemThemeChange() {
  updateTheme();
  removeMatchMedia();
  mediaQueryList.addEventListener("change", updateTheme);
}

onBeforeMount(() => {
  nextTick(() => {
    watchSystemThemeChange();
    settings.greyVal &&
      document.querySelector("html")?.classList.add("html-grey");
    settings.weakVal &&
      document.querySelector("html")?.classList.add("html-weakness");
    settings.tabsVal && tagsChange();
    settings.hideFooter && hideFooterChange();
  });
});

onUnmounted(() => removeMatchMedia());
</script>

<template>
  <LayPanel>
    <div class="p-5">
      <p :class="pClass">整体风格</p>
      <Segmented
        resize
        class="select-none"
        :modelValue="overallStyle === 'system' ? 2 : dataTheme ? 1 : 0"
        :options="themeOptions"
        @change="
          theme => {
            dataTheme = theme.index === 1;
            overallStyle = theme.option.theme;
            dataThemeChange(theme.option.theme);
            theme.index === 2 && watchSystemThemeChange();
          }
        "
      />

      <p :class="['mt-5', pClass]">导航模式</p>
      <ul class="pure-theme">
        <li
          ref="verticalRef"
          v-tippy="{ content: '左侧菜单布局', zIndex: 41000 }"
          :class="layoutTheme.layout === 'vertical' ? 'is-select' : ''"
          @click="setLayoutModel('vertical')"
        >
          <div />
          <div />
        </li>
        <li
          v-if="device !== 'mobile'"
          ref="horizontalRef"
          v-tippy="{ content: '顶部菜单布局', zIndex: 41000 }"
          :class="layoutTheme.layout === 'horizontal' ? 'is-select' : ''"
          @click="setLayoutModel('horizontal')"
        >
          <div />
          <div />
        </li>
        <li
          v-if="device !== 'mobile'"
          ref="mixRef"
          v-tippy="{ content: '混合菜单布局', zIndex: 41000 }"
          :class="layoutTheme.layout === 'mix' ? 'is-select' : ''"
          @click="setLayoutModel('mix')"
        >
          <div />
          <div />
        </li>
      </ul>

      <span v-if="useAppStoreHook().getViewportWidth > 1280">
        <p :class="['mt-5', pClass]">页面宽度</p>
        <Segmented
          resize
          class="mb-2 select-none"
          :modelValue="isNumber(settings.stretch) ? 1 : 0"
          :options="stretchTypeOptions"
          @change="stretchTypeChange"
        />
        <el-input-number
          v-if="isNumber(settings.stretch)"
          v-model="settings.stretch as number"
          :min="1280"
          :max="1600"
          controls-position="right"
          @change="value => setStretch(value)"
        />
        <button
          v-else
          v-ripple="{ class: 'text-gray-300' }"
          class="bg-transparent flex-c w-full h-20 rounded-md border border-[var(--pure-border-color)]"
          @click="setStretch(!settings.stretch)"
        >
          <div
            class="flex-bc transition-all duration-300"
            :class="[settings.stretch ? 'w-[24%]' : 'w-[50%]']"
            style="color: var(--el-color-primary)"
          >
            <IconifyIconOffline
              :icon="settings.stretch ? RightArrow : LeftArrow"
              height="20"
            />
            <div
              class="flex-grow border-b border-dashed"
              style="border-color: var(--el-color-primary)"
            />
            <IconifyIconOffline
              :icon="settings.stretch ? LeftArrow : RightArrow"
              height="20"
            />
          </div>
        </button>
      </span>

      <p class="mt-5 font-medium text-sm dark:text-white">界面显示</p>
      <ul class="setting">
        <li>
          <span class="dark:text-white">灰色模式</span>
          <el-switch
            v-model="settings.greyVal"
            inline-prompt
            active-text="开"
            inactive-text="关"
            @change="greyChange"
          />
        </li>
        <li>
          <span class="dark:text-white">色弱模式</span>
          <el-switch
            v-model="settings.weakVal"
            inline-prompt
            active-text="开"
            inactive-text="关"
            @change="weekChange"
          />
        </li>
        <li>
          <span class="dark:text-white">隐藏页签</span>
          <el-switch
            v-model="settings.tabsVal"
            inline-prompt
            active-text="开"
            inactive-text="关"
            @change="tagsChange"
          />
        </li>
        <li>
          <span class="dark:text-white">隐藏页脚</span>
          <el-switch
            v-model="settings.hideFooter"
            inline-prompt
            active-text="开"
            inactive-text="关"
            @change="hideFooterChange"
          />
        </li>
        <li>
          <span class="dark:text-white">显示 Logo</span>
          <el-switch
            v-model="logoVal"
            inline-prompt
            :active-value="true"
            :inactive-value="false"
            active-text="开"
            inactive-text="关"
            @change="logoChange"
          />
        </li>
        <li>
          <span class="dark:text-white">页签持久化</span>
          <el-switch
            v-model="settings.multiTagsCache"
            inline-prompt
            active-text="开"
            inactive-text="关"
            @change="multiTagsCacheChange"
          />
        </li>
      </ul>
    </div>
  </LayPanel>
</template>

<style lang="scss" scoped>
:deep(.right-panel .el-scrollbar__view) {
  background: linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(244 248 252 / 94%));
}

:deep(.el-divider__text) {
  font-size: 16px;
  font-weight: 700;
}

:deep(.el-switch__core) {
  --el-switch-off-color: var(--pure-switch-off-color);

  min-width: 36px;
  height: 18px;
}

:deep(.el-switch__core .el-switch__action) {
  height: 14px;
}

.pure-theme {
  display: flex;
  gap: 12px;

  li {
    position: relative;
    width: 58px;
    height: 42px;
    overflow: hidden;
    cursor: pointer;
    background: linear-gradient(180deg, #f7fbff, #ecf3f9);
    border-radius: 12px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 88%),
      0 8px 16px rgb(71 85 105 / 10%);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 88%),
        0 12px 22px rgb(71 85 105 / 14%);
    }

    &:nth-child(1) {
      div {
        &:nth-child(1) {
          width: 30%;
          height: 100%;
          background: #1b2a47;
        }

        &:nth-child(2) {
          position: absolute;
          top: 0;
          right: 0;
          width: 70%;
          height: 30%;
          background: #fff;
          box-shadow: 0 0 1px #888;
        }
      }
    }

    &:nth-child(2) {
      div {
        &:nth-child(1) {
          width: 100%;
          height: 30%;
          background: #1b2a47;
          box-shadow: 0 0 1px #888;
        }
      }
    }

    &:nth-child(3) {
      div {
        &:nth-child(1) {
          width: 100%;
          height: 30%;
          background: #1b2a47;
          box-shadow: 0 0 1px #888;
        }

        &:nth-child(2) {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30%;
          height: 70%;
          background: #fff;
          box-shadow: 0 0 1px #888;
        }
      }
    }
  }
}

.is-select {
  border: 2px solid var(--el-color-primary);
}

.setting {
  padding: 10px 0 4px;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;
    border-bottom: 1px solid rgb(91 141 239 / 8%);
  }
}

.p-5 {
  border-radius: 0 0 18px 18px;
}

:deep(.el-input-number) {
  width: 100%;
  margin-top: 6px;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 12px;
}

:deep(.dark .right-panel .el-scrollbar__view) {
  background: linear-gradient(180deg, rgb(16 27 40 / 98%), rgb(12 20 31 / 96%));
}

:deep(.dark .setting li) {
  border-bottom-color: rgb(116 157 214 / 10%);
}

:deep(.dark .pure-theme li) {
  background: linear-gradient(180deg, rgb(20 31 46 / 96%), rgb(14 23 35 / 96%));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 4%),
    0 10px 20px rgb(0 0 0 / 18%);
}

:deep(.dark .is-select) {
  box-shadow: 0 0 0 2px rgb(115 165 255 / 12%);
}

:deep(.dark .bg-transparent.flex-c) {
  background: rgb(15 24 36 / 88%) !important;
  border-color: rgb(116 157 214 / 14%) !important;
}

:deep(.dark .bg-transparent.flex-c:hover) {
  background: rgb(19 31 47 / 92%) !important;
}

:deep(.dark .project-configuration h4) {
  color: #edf4fb;
}

:deep(.dark .project-configuration) {
  background: linear-gradient(180deg, rgb(18 29 43 / 96%), rgb(15 24 36 / 96%));
}

:deep(.dark .right-panel > div:last-child) {
  background: rgb(15 24 36 / 96%);
}

:deep(.el-button--danger.is-text) {
  color: #d94f75 !important;
  border-color: rgb(225 29 72 / 14%) !important;
  background: linear-gradient(180deg, #fff 0%, #fff5f7 100%) !important;
}

:deep(.dark .el-button--danger.is-text) {
  color: #f08aa3 !important;
  background: linear-gradient(180deg, rgb(48 19 28 / 96%), rgb(35 16 22 / 96%)) !important;
  border-color: rgb(225 29 72 / 18%) !important;
}

:deep(.el-button--danger.is-text:hover) {
  background: linear-gradient(180deg, #fff 0%, #ffeef2 100%) !important;
}

:deep(.dark .el-button--danger.is-text:hover) {
  background: linear-gradient(180deg, rgb(58 21 33 / 96%), rgb(43 17 25 / 96%)) !important;
}

:deep(.pure-segmented) {
  border-radius: 14px;
  padding: 3px;
  background: rgb(238 244 250);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
}

:deep(.pure-segmented-item) {
  min-height: 42px;
  border-radius: 11px;
}

:deep(.pure-segmented-item-selected) {
  box-shadow: 0 8px 16px rgb(91 141 239 / 12%);
}

:deep(.dark .pure-segmented) {
  background: rgb(8 15 24);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
}

:deep(.dark .pure-segmented-item-selected) {
  box-shadow: 0 8px 16px rgb(0 0 0 / 20%);
}

:deep(.el-scrollbar__bar) {
  opacity: 0.8;
}

:deep(.el-scrollbar__thumb) {
  background: linear-gradient(180deg, rgb(106 167 255 / 60%), rgb(87 191 195 / 60%));
  border-radius: 999px;
}

:deep(.dark .el-scrollbar__thumb) {
  background: linear-gradient(180deg, rgb(115 165 255 / 45%), rgb(87 191 195 / 42%));
}

:deep(.el-switch.is-checked .el-switch__core) {
  box-shadow: 0 6px 14px rgb(91 141 239 / 20%);
}

:deep(.dark .el-switch.is-checked .el-switch__core) {
  box-shadow: 0 6px 14px rgb(87 191 195 / 18%);
}

:deep(.el-switch__inner .is-text) {
  font-weight: 700;
}

:deep(.dark .pure-theme li div:nth-child(2)),
:deep(.dark .pure-theme li div:nth-child(1)) {
  box-shadow: none;
}

:deep(.dark .pure-theme li:nth-child(1) div:nth-child(1)),
:deep(.dark .pure-theme li:nth-child(2) div:nth-child(1)),
:deep(.dark .pure-theme li:nth-child(3) div:nth-child(1)) {
  background: #263a52;
}

:deep(.dark .pure-theme li:nth-child(1) div:nth-child(2)),
:deep(.dark .pure-theme li:nth-child(3) div:nth-child(2)) {
  background: #dce8f6;
}

:deep(.right-panel .el-scrollbar__view) {
  min-height: 100%;
}

:deep(.project-configuration),
:deep(.right-panel > div:last-child) {
  backdrop-filter: blur(10px);
}

:deep(.project-configuration) {
  position: sticky;
  top: 0;
  z-index: 2;
}

:deep(.right-panel > div:last-child) {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(244 248 252 / 96%));
}

:deep(.dark .right-panel > div:last-child) {
  background: linear-gradient(180deg, rgb(18 29 43 / 96%), rgb(15 24 36 / 96%));
}

:deep(.pure-segmented-item-label) {
  font-weight: 600;
}

:deep(.el-input-number + .bg-transparent.flex-c) {
  margin-top: 6px;
}

:deep(.el-switch) {
  --el-switch-on-color: var(--el-color-primary);
}

:deep(.is-select) {
  border-radius: 12px;
}

:deep(.right-panel .el-scrollbar__wrap) {
  padding-bottom: 0;
}

:deep(.el-divider__text) {
  letter-spacing: 0.02em;
}

:deep(.right-panel .el-button) {
  min-height: 34px;
}

:deep(.right-panel .el-button + .el-button) {
  margin-left: 8px;
}

:deep(.setting li:last-child) {
  border-bottom: none;
}
</style>
