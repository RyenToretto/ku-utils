# @ku-utils/landing-report

## 1.1.21

### Patch Changes

- 7617aef: 重构关键事件上报为 app + token 隔离的持久化 FIFO 批量池，保证业务事件不会越过对应的 xh_alive，并将生命周期、支付及防重标记改为整批成功后提交。

  保持 landing-report 不自动发送 alive、heartbeat、start 的既有行为。

  升级注意：公开 API 不变，但自定义 reportFetch 现在必须处理 body 中最多 20 条事件，并以 resolve/reject
  表示整批成功/失败；支付服务需按稳定 orderId 幂等。SSR 不再自动发送生命周期事件，回滚前需先等待新版
  持久队列排空。

- Updated dependencies [7617aef]
  - @ku-utils/report@1.2.14

## 1.1.20

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.4
  - @ku-utils/report@1.2.13

## 1.1.19

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.3
  - @ku-utils/report@1.2.12

## 1.1.18

### Patch Changes

- 补充落地页渠道 source 归一化说明与测试覆盖，确认主动上报持续携带来源渠道。

## 1.1.17

### Patch Changes

- Updated dependencies
  - @ku-utils/report@1.2.11

## 1.1.16

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.1
  - @ku-utils/report@1.2.10

## 1.1.15

### Patch Changes

- Updated dependencies [1d8c8cf]
  - @ku-utils/utils@1.5.0
  - @ku-utils/report@1.2.9

## 1.1.14

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.3
  - @ku-utils/report@1.2.8

## 1.1.13

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.2
  - @ku-utils/report@1.2.7

## 1.1.12

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.1
  - @ku-utils/report@1.2.6

## 1.1.10

### Patch Changes

- Updated dependencies
  - @ku-utils/report@1.2.4

## 1.1.9

### Patch Changes

- feat(landing-report): 新增 Cursor rules/skills 自动安装（postinstall）

## 1.1.8

### Patch Changes

- Updated dependencies
  - @ku-utils/report@1.2.3

## 1.1.7

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.3.2
  - @ku-utils/report@1.2.2

## 1.1.6

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.3.1
  - @ku-utils/report@1.2.1

## 1.1.5

### Patch Changes

- Updated dependencies [ec3e90c]
- Updated dependencies [7f1ad63]
  - @ku-utils/report@1.2.0
  - @ku-utils/utils@1.3.0

## 1.1.4

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.2.1
  - @ku-utils/report@1.1.4

## 1.1.3

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.2.0
  - @ku-utils/report@1.1.3
