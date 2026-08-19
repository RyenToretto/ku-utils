<template>
  <div class="home">
    <p>
      Vuex count: {{ $store.state.count }}
      <du-button
        size="small"
        @click="$store.commit('increment')"
      >
        +1
      </du-button>
    </p>

    <nav class="pg-nav">
      <a href="#ui">ui-vue2 / skin</a>
      <a href="#utils">utils / constants</a>
      <a href="#custom-columns">v2-custom-columns</a>
      <a href="#toolchain">工程配置</a>
    </nav>

    <section
      id="ui"
      class="pg-section"
    >
      <h3>@ku-utils/skin + @ku-utils/ui-vue2</h3>
      <p class="pg-hint">
        入口已
        <code class="pg-code">import '@ku-utils/skin'</code>
        ，主色应为 Lark 蓝
        <code class="pg-code">#3370ff</code>
        。
      </p>
      <div class="pg-row">
        <du-button type="primary">Primary</du-button>
        <du-button type="success">Success</du-button>
        <du-button type="warning">Warning</du-button>
        <du-button type="danger">Danger</du-button>
        <du-button>Default</du-button>
      </div>
      <div class="pg-row">
        <du-status-tag status="success">成功</du-status-tag>
        <du-status-tag status="warning">警告</du-status-tag>
        <du-status-tag status="danger">危险</du-status-tag>
        <du-status-tag status="info">信息</du-status-tag>
      </div>
      <du-empty description="DuEmpty：暂无内容" />
    </section>

    <section
      id="utils"
      class="pg-section"
    >
      <h3>@ku-utils/utils + @ku-utils/constants</h3>
      <ul class="pg-list">
        <li>
          formatDate:
          <code class="pg-code">{{ dated }}</code>
        </li>
        <li>
          emptyReplace(null):
          <code class="pg-code">{{ empty }}</code>
        </li>
        <li>
          camelCase('hello_world'):
          <code class="pg-code">{{ camel }}</code>
        </li>
      </ul>
      <div class="pg-row">
        <input
          v-model="email"
          class="pg-input"
          placeholder="校验 REGEX.EMAIL"
        />
        <span :class="emailOk ? 'pg-ok' : 'pg-bad'">
          {{ emailOk ? '邮箱合法' : '邮箱不合法' }}
        </span>
      </div>
    </section>

    <CustomColumnsDemo />

    <section
      id="toolchain"
      class="pg-section"
    >
      <h3>工程配置包</h3>
      <ul class="pg-list">
        <li>
          <code class="pg-code">@ku-utils/eslint-config/vue2</code>
          →
          <code class="pg-code">eslint.config.js</code>
        </li>
        <li>
          <code class="pg-code">@ku-utils/prettier-config</code>
          → 根 prettier
        </li>
        <li>
          <code class="pg-code">@ku-utils/tsconfig</code>
          → 本仓统一 TS 配置（本 playground 为 Vue 2 + JS）
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { REGEX } from '@ku-utils/constants';
import { camelCase, emptyReplace, formatDate } from '@ku-utils/utils';

import CustomColumnsDemo from '@/demos/CustomColumnsDemo.vue';

export default {
  name: 'Home',
  components: { CustomColumnsDemo },
  data() {
    return {
      dated: formatDate(Date.now()),
      empty: emptyReplace(null),
      camel: camelCase('hello_world'),
      email: 'dev@example.com',
    };
  },
  computed: {
    emailOk() {
      return REGEX.EMAIL.test(this.email);
    },
  },
};
</script>
