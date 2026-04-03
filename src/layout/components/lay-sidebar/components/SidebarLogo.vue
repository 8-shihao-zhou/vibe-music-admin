<script setup lang="ts">
import { computed } from "vue";
import { getTopMenu } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";

defineProps({
  collapse: Boolean
});

const { title, getLogo } = useNav();

const brandMain = computed(() => {
  return title.value === "AI Music Admin" ? "AI Music" : title.value;
});

const brandSub = computed(() => {
  return title.value === "AI Music Admin" ? "Admin" : "Console";
});
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <span class="brand-mark">
          <img :src="getLogo()" alt="logo" />
        </span>
        <span class="sidebar-title">
          <strong>{{ brandMain }}</strong>
          <em>{{ brandSub }}</em>
        </span>
      </router-link>
      <router-link
        v-else
        key="expand"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <span class="brand-mark">
          <img :src="getLogo()" alt="logo" />
        </span>
        <span class="sidebar-title">
          <strong>{{ brandMain }}</strong>
          <em>{{ brandSub }}</em>
        </span>
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 48px;
  overflow: hidden;

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;
    margin: 4px 8px;
    padding: 6px 8px;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      rgb(255 255 255 / 12%),
      rgb(255 255 255 / 4%)
    );
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 12%),
      0 10px 20px rgb(15 23 42 / 12%);
    backdrop-filter: blur(10px);

    .brand-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      margin-right: 10px;
      border-radius: 11px;
      background: linear-gradient(145deg, #f7fbff 0%, #deecff 100%);
      box-shadow:
        0 8px 16px rgb(59 130 246 / 16%),
        inset 0 1px 0 rgb(255 255 255 / 88%);
      flex-shrink: 0;
    }

    img {
      display: inline-block;
      width: 20px;
      height: 20px;
    }

    .sidebar-title {
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      color: var(--pure-theme-sub-menu-active-text);

      strong,
      em {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      strong {
        font-size: 16px;
        line-height: 1.1;
        font-weight: 800;
        letter-spacing: 0.01em;
        color: #fff;
      }

      em {
        margin-top: 3px;
        font-size: 9px;
        line-height: 1;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgb(226 232 240 / 78%);
      }
    }
  }

  &.collapses {
    .sidebar-logo-link {
      justify-content: center;
      margin: 4px auto;
      padding: 5px 0;
      width: 40px;
      border-radius: 14px;
    }

    .brand-mark {
      margin-right: 0 !important;
      width: 30px !important;
      height: 30px !important;
      border-radius: 10px !important;
    }

    img {
      width: 18px;
      height: 18px;
    }

    .sidebar-title {
      width: 0;
      opacity: 0;
      transform: translateX(-4px);
      pointer-events: none;
    }
  }
}
</style>
