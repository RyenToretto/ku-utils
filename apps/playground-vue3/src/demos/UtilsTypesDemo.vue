<template>
  <section
    id="utils"
    class="pg-section"
  >
    <h3>@ku-utils/utils + constants + types</h3>
    <p class="pg-hint">纯函数、正则与编译期类型（SelectOption / UserInfo）。</p>

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
      <li>
        types.UserInfo.username:
        <code class="pg-code">{{ demoUser.username }}</code>
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

    <div class="pg-row">
      <span
        v-for="opt in selectOptions"
        :key="String(opt.value)"
        class="pg-chip"
      >
        {{ opt.label }}
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { REGEX } from '@ku-utils/constants';
import type { SelectOption, UserInfo } from '@ku-utils/types';
import { camelCase, emptyReplace, formatDate } from '@ku-utils/utils';
import { computed, ref } from 'vue';

defineOptions({ name: 'UtilsTypesDemo' });

const dated = formatDate(Date.now());
const empty = emptyReplace(null);
const camel = camelCase('hello_world');

const demoUser: UserInfo = {
  id: '1',
  username: 'playground',
  nickname: '演示用户',
  avatar: '',
  email: 'dev@example.com',
  phone: '',
  roles: ['demo'],
  permissions: ['pg:ok'],
};

const selectOptions: SelectOption[] = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
];

const email = ref('dev@example.com');
const emailOk = computed(() => REGEX.EMAIL.test(email.value));
</script>

<style>
.pg-list {
  margin: 0;
  padding-left: 1.2rem;
  line-height: 1.8;
}

.pg-chip {
  padding: 0.15rem 0.55rem;
  font-size: var(--ku-font-size-sm);
  color: var(--ku-text-primary);
  background: var(--ku-neutral-100);
  border-radius: var(--ku-radius-sm);
}
</style>
