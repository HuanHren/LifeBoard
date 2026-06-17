import type { TranslationCatalog } from '@/i18n/keys'
import { zhCNModules } from '@/i18n/locales/zh-CN-modules'

export const zhCN = {
  'shell.skipToMain': '跳到主要内容',
  'shell.sidebar.primaryLabel': '主导航',
  'shell.sidebar.mainSectionsLabel': '主要功能',
  'shell.sidebar.tagline': '个人日常工作台',
  'shell.sidebar.footer': '坚持本地优先，已保存的数据留在此浏览器中。',
  'shell.mobile.primaryLabel': '移动端主导航',
  'shell.theme.appearance': '外观',
  'shell.theme.system': '跟随系统',
  'shell.theme.light': '浅色',
  'shell.theme.dark': '深色',
  'shell.theme.changeLabel': '当前主题模式：{mode}。切换主题模式',
  'navigation.home.label': '首页',
  'navigation.home.description': '每日概览',
  'navigation.weather.label': '天气',
  'navigation.weather.description': '本地天气状况',
  'navigation.todos.label': '待办',
  'navigation.todos.description': '任务与日期规划',
  'navigation.tools.label': '工具',
  'navigation.tools.description': '日常实用工具',
  'navigation.bookmarks.label': '书签',
  'navigation.bookmarks.description': '保存的参考资料',
  'navigation.settings.label': '设置',
  'navigation.settings.description': '外观与布局',
  'settings.page.title': '设置',
  'settings.page.description':
    '管理此浏览器中的外观、语言、本地数据、隐私和 LifeBoard 备份。',
  'settings.section.appearance.title': '外观',
  'settings.section.appearance.description': '此偏好仅保存在当前浏览器中。',
  'settings.section.language.title': '语言',
  'settings.section.language.description':
    '选择界面语言，并下载内置翻译源文件。',
  'settings.section.localData.title': '本地数据',
  'settings.section.localData.description':
    '直接查看 LifeBoard 当前保存在此浏览器中的数据。',
  'settings.section.backup.title': '备份与恢复',
  'settings.section.backup.description': '使用由你保管的文件迁移本地 LifeBoard 数据。',
  'settings.section.privacy.title': '隐私',
  'settings.section.privacy.description': 'LifeBoard 清楚说明本地数据边界。',
  'settings.section.clearData.title': '清除本地数据',
  'settings.section.clearData.description':
    '只移除你选择的 LifeBoard 数据，每次破坏性操作都会先请求确认。',
  'settings.theme.legend': '主题模式',
  'settings.theme.helper': '选择 LifeBoard 在此浏览器中的显示方式。',
  'settings.theme.systemDescription': '跟随此设备的外观偏好。',
  'settings.theme.lightDescription': '使用 LifeBoard 浅色配色。',
  'settings.theme.darkDescription': '使用 LifeBoard 深色配色。',
  'settings.theme.storageError': '无法在此浏览器中保存主题偏好。',
  'settings.language.legend': '界面语言',
  'settings.language.helper': '此偏好仅保存在当前浏览器中，并会立即生效。',
  'settings.language.chineseName': '中文（简体）',
  'settings.language.englishName': '英语（美国）',
  'settings.language.chineseDescription': '使用简体中文界面。',
  'settings.language.englishDescription': '使用美国英语界面。',
  'settings.language.saved': '界面语言已切换为{language}。',
  'settings.language.storageError': '无法在此浏览器中保存语言偏好。',
  'settings.translationExport.title': '翻译源文件',
  'settings.translationExport.description':
    '将内置的中文和英文界面文本下载为 JSON 文件。',
  'settings.translationExport.privacy':
    '文件只包含静态应用文本，不包含任务、书签、网址、笔记、天气数据或备份。',
  'settings.translationExport.action': '下载翻译源文件',
  'settings.translationExport.success': '翻译源文件已下载。',
  'settings.translationExport.error': '无法创建或下载翻译源文件。',
  'settings.common.weather': '天气',
  'settings.common.todos': '待办',
  'settings.common.bookmarks': '书签',
  'settings.common.tools': '工具',
  'settings.common.cancel': '取消',
  'settings.localData.selectedCity': '已选择城市：{city}',
  'settings.localData.noCity': '未保存城市。',
  'settings.localData.taskOneCountdownOne': '已保存 1 个任务和 1 个倒计时。',
  'settings.localData.taskOneCountdownMany':
    '已保存 1 个任务和 {countdownCount} 个倒计时。',
  'settings.localData.taskManyCountdownOne':
    '已保存 {taskCount} 个任务和 1 个倒计时。',
  'settings.localData.taskManyCountdownMany':
    '已保存 {taskCount} 个任务和 {countdownCount} 个倒计时。',
  'settings.localData.bookmarkOne': '已保存 1 个书签。',
  'settings.localData.bookmarkMany': '已保存 {count} 个书签。',
  'settings.localData.toolsNotSaved': '工具输入不会被保存。',
  'settings.backup.exportTitle': '导出备份',
  'settings.backup.exportDescription':
    '将主题、已选城市、任务、倒计时和书签下载为 JSON 文件。',
  'settings.backup.exportAction': '导出 LifeBoard 数据',
  'settings.backup.importTitle': '导入备份',
  'settings.backup.importDescription':
    '选择不超过 1MB 的 LifeBoard JSON 备份文件。文件只会在此浏览器中读取。',
  'settings.backup.fileAction': '选择备份文件',
  'settings.backup.reviewAction': '检查替换内容',
  'settings.backup.discardAction': '舍弃文件',
  'settings.backupSummary.title': '备份已可供检查',
  'settings.backupSummary.exported': '导出时间',
  'settings.backupSummary.theme': '主题',
  'settings.backupSummary.weatherCity': '天气城市',
  'settings.backupSummary.none': '无',
  'settings.backupSummary.planningData': '计划数据',
  'settings.backupSummary.bookmarks': '书签',
  'settings.backupSummary.taskOne': '1 个任务',
  'settings.backupSummary.taskMany': '{count} 个任务',
  'settings.backupSummary.countdownOne': '1 个倒计时',
  'settings.backupSummary.countdownMany': '{count} 个倒计时',
  'settings.backupSummary.planningCounts': '{tasks}，{countdowns}',
  'settings.privacy.weatherTitle': '天气请求',
  'settings.privacy.weatherDescription':
    '天气预报和城市搜索请求会直接发送到 Open-Meteo。',
  'settings.privacy.localTitle': '本地计划',
  'settings.privacy.localDescription':
    '已选择城市、待办、倒计时和书签保存在此浏览器中。',
  'settings.privacy.toolsTitle': '工具输入',
  'settings.privacy.toolsDescription':
    '输入到工具中的文本只会在本地处理，不会保存。',
  'settings.privacy.backupTitle': '备份文件',
  'settings.privacy.backupDescription':
    '导出的文件保存在本地。导入文件只会在你选择后读取，不会上传。',
  'settings.clearData.weatherDescription':
    '移除已选择城市和当前内存中的天气预报。',
  'settings.clearData.todosOneOne': '移除 1 个任务和 1 个倒计时。',
  'settings.clearData.todosOneMany':
    '移除 1 个任务和 {countdownCount} 个倒计时。',
  'settings.clearData.todosManyOne':
    '移除 {taskCount} 个任务和 1 个倒计时。',
  'settings.clearData.todosManyMany':
    '移除 {taskCount} 个任务和 {countdownCount} 个倒计时。',
  'settings.clearData.bookmarkOne': '移除 1 个已保存书签。',
  'settings.clearData.bookmarkMany': '移除 {count} 个已保存书签。',
  'settings.clearData.toolsDescription': '没有保存的工具输入可清除。',
  'settings.clearData.clearWeather': '清除天气',
  'settings.clearData.clearTodos': '清除待办',
  'settings.clearData.clearBookmarks': '清除书签',
  'settings.clearData.nothingSaved': '没有已保存内容',
  'settings.clearData.allTitle': '清除全部 LifeBoard 数据',
  'settings.clearData.allDescription':
    '移除 LifeBoard 保存的主题偏好、已选城市、任务、倒计时和书签。',
  'settings.clearData.allAction': '清除全部数据',
  'settings.dialog.importTitle': '替换本地 LifeBoard 数据？',
  'settings.dialog.importDescription':
    '这会使用已检查的备份替换当前主题偏好、已选城市、任务、倒计时和书签。',
  'settings.dialog.importConfirm': '导入并替换',
  'settings.dialog.weatherTitle': '清除天气数据？',
  'settings.dialog.weatherDescription':
    '这会移除已选择城市和当前内存中的天气预报。',
  'settings.dialog.todosTitle': '清除待办数据？',
  'settings.dialog.todosDescription':
    '这会移除此浏览器中保存的所有任务和倒计时。',
  'settings.dialog.bookmarksTitle': '清除书签数据？',
  'settings.dialog.bookmarksDescription':
    '这会移除此浏览器中保存的所有书签。',
  'settings.dialog.allTitle': '清除全部 LifeBoard 数据？',
  'settings.dialog.allDescription':
    '这会移除主题偏好、已选城市、当前天气预报、任务、倒计时和书签。工具输入不会被保存。',
  'settings.dialog.allConfirm': '清除全部数据',
  'settings.dialog.allAcknowledgement':
    '我了解此操作会移除此浏览器中保存的全部 LifeBoard 数据。',
  'settings.message.backupDownloaded': '备份已下载到此设备。',
  'settings.message.backupDownloadFailed': '无法创建或下载备份。',
  'settings.message.backupImported': '备份已导入，当前本地 LifeBoard 数据已被替换。',
  'settings.message.weatherCleared': '天气数据已清除。',
  'settings.message.todosCleared': '待办和倒计时已清除。',
  'settings.message.bookmarksCleared': '书签已清除。',
  'settings.message.allCleared':
    '全部 LifeBoard 本地数据已清除，主题模式已重置为跟随系统。',
  'settings.error.storageUnavailable':
    '浏览器存储不可用，未更改任何 LifeBoard 数据。',
  'settings.error.themeInvalid':
    '已保存的主题偏好无效。为便于恢复，数据保持不变。',
  'settings.error.weatherInvalid':
    '已保存的天气位置无效。为便于恢复，数据保持不变。',
  'settings.error.weatherInvalidJson':
    '已保存的天气位置包含无效 JSON。为便于恢复，数据保持不变。',
  'settings.error.backupTooLarge':
    '此备份超过 1MB。请选择较小的 LifeBoard JSON 备份。',
  'settings.error.fileUnreadable': '无法读取所选文件。',
  'settings.error.fileInvalidJson': '所选文件不包含有效 JSON。',
  'settings.error.storageOperationRestored':
    '存储操作失败，现有 LifeBoard 数据已恢复。',
  'settings.error.storageOperationRestoreFailed':
    '存储操作失败，浏览器也无法完整恢复之前的数据。',
  'settings.error.backupIncomplete': '此文件不是完整的 LifeBoard 备份。',
  'settings.error.backupVersionUnsupported':
    '不支持此备份版本。LifeBoard 当前接受版本 1。',
  'settings.error.backupDateInvalid': '备份导出日期缺失或无效。',
  'settings.error.backupThemeInvalid': '备份中的主题偏好无效。',
  'settings.error.backupWeatherInvalid': '备份中的天气位置无效。',
  'settings.error.backupTodosInvalid': '备份中的待办数据无效。',
  'settings.error.backupBookmarksInvalid': '备份中的书签数据无效。',
  'settings.error.planningStorageUnavailable':
    '本地存储不可用，无法在此浏览器中读取计划数据。',
  'settings.error.planningInvalidJson':
    '已保存的计划数据包含无效 JSON。为便于恢复，数据保持不变。',
  'settings.error.planningFormatInvalid':
    '已保存的计划数据不符合支持的格式，数据保持不变。',
  'settings.error.bookmarkStorageUnavailable':
    '本地存储不可用，无法在此浏览器中读取书签数据。',
  'settings.error.bookmarkInvalidJson':
    '已保存的书签数据包含无效 JSON。为便于恢复，数据保持不变。',
  'settings.error.bookmarkFormatInvalid':
    '已保存的书签数据不符合支持的格式，数据保持不变。',
  'notFound.routeTitle': '页面未找到',
  'notFound.eyebrow': '页面未找到',
  'notFound.title': 'LifeBoard 中没有这个位置。',
  'notFound.description': '地址可能已失效或输入有误。返回每日概览继续使用。',
  'notFound.action': '返回首页',
  'home.hero.title': '一天所需，尽在这里。',
  'home.hero.description': '从本地天气、已保存的计划、私人工具和常用资料开始。',
  'home.hero.contextTitle': '实用，不做表面文章',
  'home.hero.contextDescription':
    '天气跟随你选择的城市，待办与倒数来自本地保存的计划，工具输入不会出现在首页，书签只展示你亲自保存的资料。',
  'home.settings.title': '工作台设置',
  'home.settings.description': '在一个清晰的位置管理外观和浏览器本地数据。',
  'home.settings.cardDescription':
    '管理外观、检查本地数据、创建或恢复备份、了解隐私边界并清除已保存的信息。',
  'home.settings.action': '打开设置',
  'home.settings.status': '本地控制',
  ...zhCNModules,
} satisfies TranslationCatalog
