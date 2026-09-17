# 智能工单分诊台 / Support Triage Hub

面向售后与客服主管的 Xpert Agentic App。它把客户问题转为一张可审核、可恢复的工单：AI 给出分类、优先级、建议处理团队、建议回复及理由；人工在 Workbench 审核结果。AI 不能自行向客户回复或指派人员。

## 核心流程

1. 用户在助手中提交一条客户问题。
2. Assistant 提取分诊字段并调用 `support_triage_create_ticket` 保存工单。
3. 用户在“智能工单分诊台”查看已保存的分诊建议，并完成业务确认。
4. 重新进入 Workbench 或刷新页面后，通过 TypeORM 持久化数据恢复记录。
5. 模型调用异常时，工单保留 `failed` 状态与脱敏失败原因；人工选择“重试”后，`support_triage_retry_ticket` 恢复至待审核状态，不创建重复工单。

## AI 边界

- AI 只生成建议，不拥有确认、外发回复或分派权限。
- 工具输入采用严格、有限长度的 Zod schema；工具输出只返回工单摘要和下一步。
- 所有查询和更新均按当前 tenant 与 organization 作用域隔离。

## 开发与验证

```powershell
cd community/apps/support-triage
pnpm run build
pnpm run test
pnpm run verify:dist

# 在 Xpert 平台仓库根目录执行；凭证放在 community/.env，勿提交。
pnpm plugin:deploy:local --plugin-dir <plugin-repo>/community/apps/support-triage --scope tenant
```

部署后，重启 API，确认插件已加载；再从模板创建“智能工单分诊助手”，连接 `SupportTriageMiddleware`，并在 Workbench 完成一次真实模型调用、人工审核、刷新恢复与失败重试测试。

## 环境变量

按仓库 `community/env.example` 创建本地 `community/.env`，至少配置 `XPERT_API_URL`、`XPERT_TOKEN` 和对应安装范围。不要把真实 Token、客户数据或截图中的私人信息提交到仓库。

## 取舍与限制

本次面试实现聚焦单条工单闭环：未接入第三方客服系统、自动派单、外发通知或复杂权限角色。AI 建议必须由人工确认；模型供应商的可用性由 Xpert 已配置的 Assistant 模型决定。

## AI 协作说明

使用 Codex 辅助完成仓库结构分析、SDK 约束核对、数据模型和插件实现。主要取舍是把“分诊建议”和“人工确认”分离：AI 只写入可审核草稿，避免把聊天建议误当成外部业务动作。复用范围为仓库内现有社区应用的插件工程约定；实现的业务模型、工具名称、分诊流程和文档均为本应用新增。仓库整体采用 AGPL-3.0，本应用沿用该许可。
