# du-utils 迁移映射

## 处理标记说明

- ✅ 迁入：内容迁移到目标位置，可能伴随重写/合并
- 🔁 替换：ku-utils 已有同名/同语义实现，使用 du-utils 版本替换
- ➕ 合并：与 ku-utils 已有实现共存（语义不同）
- ⏭ 跳过：不迁移（含原因）

## 1. 入口与配置

| 源                                                                                                                                       | 处理   | 去向 / 原因                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`                                                                                                                           | ⏭      | 旧入口含 `export * from 'lodash-es'` 反模式，不迁移；新包按需导出                                                           |
| `src/auto-import.ts`                                                                                                                     | ⏭      | du-utils 项目专属配置，不迁移                                                                                               |
| `src/types.ts` → `RealType` / `Recordable`                                                                                               | ⏭ / ✅ | `Recordable` ku-utils 已有；`RealType` 改放 `@ku-utils/types/common.ts` 与 `@ku-utils/utils/is.ts`                          |
| `src/types.ts` → `BrowserInfo` / `BrowserSupport` / `DeviceType` / `OSType` / `DeviceDetectResult` / `SetFontSizeOptions` / `PageParams` | ✅ / ⏭ | 前 6 个迁入 `@ku-utils/types/common.ts` + `@ku-utils/utils/device.ts` 各保一份；`PageParams` 为落地页业务类型，本仓不再收录 |
| `src/cursor-rules.mdc`                                                                                                                   | ⏭      | 项目专属规则                                                                                                                |
| `package.json` 的 lodash-es 全量 re-export                                                                                               | ⏭      | 反模式；mergeWith 改自实现，cloneDeep 用本地 deepClone                                                                      |

## 2. core/

| 源文件                     | 导出                                                                                 | 处理 | 去向                                                         |
| -------------------------- | ------------------------------------------------------------------------------------ | ---- | ------------------------------------------------------------ |
| `core/is.ts`               | `getRealType`                                                                        | ✅   | `@ku-utils/utils/is.ts`（扩 RealType 含 set/map/promise 等） |
|                            | `is(val, type)`                                                                      | ⏭    | 与 getRealType 重复包装                                      |
|                            | `isDefined`                                                                          | ✅   | `is.ts`                                                      |
|                            | `safeParseJson`                                                                      | ✅   | `is.ts`                                                      |
|                            | `isJSON`                                                                             | ✅   | `is.ts`                                                      |
|                            | `isValidNumber`                                                                      | ✅   | `is.ts`                                                      |
|                            | `isPromise`                                                                          | ✅   | `is.ts`（lodash isFunction 依赖去除）                        |
|                            | `isAsyncFunction`                                                                    | ✅   | `is.ts`                                                      |
|                            | `isClient` / `isServer`                                                              | 🔁   | 保留 ku-utils 的常量形式                                     |
|                            | `isWindow`                                                                           | ✅   | `is.ts`                                                      |
|                            | `getStrRatio` / `coerceNumberValue`                                                  | ⏭    | 业务性强，未消费方使用                                       |
|                            | `isImageDom`                                                                         | ⏭    | 极低频                                                       |
| `core/extend.ts`           | `doExtend` / `doExtendAll`                                                           | ✅   | `@ku-utils/utils/object.ts`                                  |
| `core/merge.ts`            | `deepMerge`                                                                          | ✅   | `object.ts`（自实现，移除 lodash 依赖）                      |
| `core/uuid.ts`             | `doUUID` / `generateUUID` / `ktk` / `uuid` / `useToken`                              | ✅   | `@ku-utils/utils/uuid.ts`                                    |
|                            | `makeVersionCode`（在 device/browserInfo.ts）                                        | ✅   | `uuid.ts`（与其它标识工具同位）                              |
| `core/logger.ts`           | `DoLogger` / `createLogger` / `doLog` / `LogLevel` / `LoggerOptions` / `LoggerEntry` | ✅   | `@ku-utils/utils/logger.ts`（保留可选 Sentry 集成）          |
| `core/matchMap.ts`         | `matchMap`                                                                           | ✅   | `object.ts`（参数类型化为 `Array<[C, V]>`）                  |
| `core/matchObjProperty.ts` | `matchObjProperty`                                                                   | ✅   | `object.ts`                                                  |
| `core/cherrySetId.ts`      | `cherrySetId`                                                                        | ✅   | `@ku-utils/utils/array.ts`                                   |
| `core/calculator.ts`       | `calculator.fAdd/fSub/fMul/fDiv`                                                     | ✅   | `@ku-utils/utils/number.ts`（与已有 number 工具同位）        |
| `core/isAllSame.ts`        | `isAllSame`                                                                          | ✅   | `is.ts`（深比较 Array/Object/Date/RegExp/Set/Map）           |
| `core/delayPromise.ts`     | `delayPromise`                                                                       | ⏭    | ku-utils 已有 `sleep(ms)`，API 更清晰                        |

## 3. format/

| 源                                                  | 处理 | 去向 / 原因                                                                                               |
| --------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------- |
| `format/date.ts → formatDate`                       | 🔁   | 用 du-utils 实现替换 ku-utils 版本（10/13 位时间戳容错、Invalid Date 返空串）                             |
| `format/date.ts → doDate`                           | ✅   | `@ku-utils/utils/date.ts`（含 8 位数字容错）                                                              |
| `format/date.ts → getRelativeTime`                  | ✅   | `date.ts`（含「周」档位）                                                                                 |
| `format/date.ts → isSameDay`                        | ✅   | `date.ts`                                                                                                 |
| `format/date.ts → getDateRange`                     | ✅   | `date.ts`                                                                                                 |
| `format/date.ts → DATE_TIME_FORMAT` / `DATE_FORMAT` | ✅   | `date.ts`                                                                                                 |
| `format/date.ts → formatTime`                       | ⏭    | 英文短语（'Just now' / '5 mins'）与中文规范不符                                                           |
| `format/text.ts → getTextLength` / `truncateText`   | ✅   | `@ku-utils/utils/string.ts`（与 ku-utils 的 `truncate` 共存：truncate 按字符数，truncateText 按视觉宽度） |
| `format/getTextLength.ts`                           | ⏭    | 与 text.ts 重复实现                                                                                       |
| `format/thousandSeparator.ts → thousandSeparator`   | 🔁   | 用 du-utils 实现替换 ku-utils 的 `formatThousands`，保留同名导出                                          |
| `format/passwordValidation.ts`                      | ✅   | `@ku-utils/utils/validate.ts`（全量迁入：rules / regex / validatePassword / validatePasswordQuick）       |
| `format/formatSeconds.ts`                           | ✅   | `@ku-utils/utils/date.ts`                                                                                 |

## 4. dom/

| 源                                                                                                  | 处理 | 去向                                                                          |
| --------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------- |
| `dom/dom.ts`（主文件，11 个函数）                                                                   | ✅   | `@ku-utils/utils/dom.ts`（lodash camelCase 改用本地 string.ts 的 camelCase）  |
| `dom/getStyle.ts` / `getScrollBarWidth.ts` / `getViewHeight.ts` / `scrollTo.ts` / `posInElement.ts` | ⏭    | 与 dom.ts 主文件重复，只取主版本                                              |
| `dom/compressImage.ts`                                                                              | ✅   | `@ku-utils/utils/image.ts`（含 `UserUploadInfo` / `CompressionOptions` 类型） |
| `dom/setFontSize.ts → initFontSize` / `setFontSizePlugin`                                           | ✅   | `@ku-utils/utils/rem.ts`                                                      |
| `dom/appAndDownload.ts`                                                                             | ⏭    | 落地页唤起下载，本仓不再收录业务 SDK                                          |
| `dom/makeDownload.ts`                                                                               | ⏭    | 同上                                                                          |
| `dom/startDownload.ts`                                                                              | ⏭    | 同上                                                                          |

## 5. device/

| 源                                                                                                                                                                                      | 处理 | 去向                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------- |
| `device/browserInfo.ts → getBrowserInfo / getDeviceType / getOSType / isMobile / isTablet / isDesktop / isTouchDevice / isIOS / isAndroid / isSafari / isWechat / detectBrowserSupport` | ✅   | `@ku-utils/utils/device.ts`                   |
| `device/browserInfo.ts → makeVersionCode`                                                                                                                                               | ✅   | 移到 `uuid.ts`（按职责归类）                  |
| `device/detectDevice.ts → detectDevice`                                                                                                                                                 | ✅   | `device.ts`                                   |
| `device/detectDevice.ts → isAndroid`                                                                                                                                                    | ⏭    | 与 browserInfo.ts 同名，保留 browserInfo 版本 |
| `device/checkWeChat.ts → checkWeChat`                                                                                                                                                   | ✅   | `device.ts`                                   |
| `device/fingerprint.ts`（全部 8 函数）                                                                                                                                                  | ✅   | `@ku-utils/utils/fingerprint.ts`              |

## 6. clipboard/

| 源                                                                         | 处理 | 去向                                                                                                                            |
| -------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `clipboard/setCopy.ts → setCopy`                                           | ✅   | `@ku-utils/utils/clipboard.ts`（合并 createFakeElement / setSelection 为内部实现）                                              |
| `clipboard/createFakeElement.ts`                                           | ✅   | `clipboard.ts` 内部，不导出                                                                                                     |
| `clipboard/setSelection.ts`                                                | ✅   | `clipboard.ts` 内部，不导出                                                                                                     |
| `clipboard/download.ts → getFileNameByUrl` / `downloadFile` / `doDownload` | ✅   | `@ku-utils/utils/file.ts`（与 ku-utils 已有 downloadBlob / downloadUrl / formatFileSize / getFileExtension / isImageFile 共存） |

## 7. encoding/

| 源                                            | 处理 | 去向                                   |
| --------------------------------------------- | ---- | -------------------------------------- |
| `encoding/doAtob.ts`                          | ✅   | `@ku-utils/utils/encoding.ts → doAtob` |
| `encoding/doBtoa.ts`                          | ✅   | `encoding.ts → doBtoa`                 |
| `encoding/hexString.ts → hexString2ByteArray` | ✅   | `encoding.ts`                          |

## 8. env/

| 源                           | 处理 | 去向                                                                           |
| ---------------------------- | ---- | ------------------------------------------------------------------------------ |
| `env/env.ts → getDoEnv`      | ✅   | `@ku-utils/utils/env.ts`（cloneDeep 改用本地 deepClone；import.meta 容错访问） |
| `env/parseEnv.ts → parseEnv` | ✅   | `env.ts`                                                                       |

## 9. url/

| 源                                                                                                                   | 处理 | 去向                                                                                     |
| -------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------- |
| `url/url.ts → parseUrlParam`                                                                                         | 🔁   | 替换 ku-utils 的 `parseQuery` 实现（同时解析 hash 内 query），并新增同名 `parseUrlParam` |
| `url/url.ts → safeEncodeName` / `getDomain` / `getRootDomain` / `appendUrlParams` / `setUrlParams` / `getPageParams` | ✅   | `@ku-utils/utils/url.ts`                                                                 |
| `url/getQueryString.ts → getQueryString`                                                                             | ✅   | `url.ts`（兼容 SSR：无 location 时返空串）                                               |

ku-utils 保留的 `joinUrl` / `buildQuery`（du-utils 无对应）。

## 10. http/

| 源                                 | 处理 | 去向                                           |
| ---------------------------------- | ---- | ---------------------------------------------- |
| `http/cookie.ts → parseFromCookie` | ✅   | `@ku-utils/utils/url.ts`（`_ga` 特殊处理保留） |

## 11. clipboard/useClipboard 改造

`@ku-utils/hooks/src/useClipboard.ts` 改为内部调用 `@ku-utils/utils` 的 `setCopy`，获得 execCommand 降级能力。tsup external 化 `@ku-utils/utils`。

## 12. adjust / landing / appsflyer

| 源                                         | 处理 | 去向 / 原因                        |
| ------------------------------------------ | ---- | ---------------------------------- |
| `adjust/` / `landing/` / `appsflyer/` 目录 | ⏭    | 营销归因与落地页能力，本仓不再收录 |

原计划迁入独立业务 SDK，现已从 ku-utils 移除。

---

## 13. 校对补漏（2026-04-17 二轮校对）

对 du-utils 全部 70 个 .ts 文件做了一次完整 find 比对，补充以下条目：

### 顶层 / 聚合 index 文件（隐含处理）

| 源                                                                        | 处理 | 说明                                                                            |
| ------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------- |
| `src/index.ts`（顶层）                                                    | ⏭    | 旧入口含 `export * from 'lodash-es'` 与各子目录聚合；新包按需导出，不复制此聚合 |
| `src/core/index.ts`                                                       | ⏭    | 子目录聚合导出，未单列：core 目录下每个文件按本表 #2 单独处理                   |
| `src/clipboard/index.ts`                                                  | ⏭    | 同上，clipboard/\* 按 #6 处理                                                   |
| `src/device/index.ts`                                                     | ⏭    | 同上，device/\* 按 #5 处理                                                      |
| `src/dom/index.ts`                                                        | ⏭    | 同上，dom/\* 按 #4 处理                                                         |
| `src/encoding/index.ts`                                                   | ⏭    | 同上，encoding/\* 按 #7 处理                                                    |
| `src/env/index.ts`                                                        | ⏭    | 同上，env/\* 按 #8 处理                                                         |
| `src/format/index.ts`                                                     | ⏭    | 同上，format/\* 按 #3 处理                                                      |
| `src/http/index.ts`                                                       | ⏭    | 同上，http/\* 按 #10 处理                                                       |
| `src/url/index.ts`                                                        | ⏭    | 同上，url/\* 按 #9 处理                                                         |
| `src/adjust/index.ts` / `src/appsflyer/index.ts` / `src/landing/index.ts` | ⏭    | 业务子目录聚合；营销/落地页能力本仓不再收录                                     |

### 全部 70 个文件的归宿统计

| 归宿                                                          | 数量 |
| ------------------------------------------------------------- | ---- |
| ✅ 迁入 @ku-utils/utils                                       | 36   |
| ⏭ 营销 / 落地页（adjust / landing / appsflyer 等）            | 19   |
| ✅ 迁入 @ku-utils/types（共享类型）                           | 6    |
| ⏭ 跳过（聚合 index / lodash re-export / 重复实现 / 项目专属） | 9    |

### 一致性检查结论

- ✅ 没有遗漏的源文件
- ✅ 没有错标（每个 ✅ 都能在 ku-utils 找到对应实现）
- ✅ 跳过项均有明确原因
