---
title: Trusted web authorities enable persistent browser settings
status: implemented
---

连接 Host 插件把已校验的 `trustedHosts` 注入每个服务页面。客户端复用 Host authority 匹配器计算 `ctx.connection.isLoopback`，因此显式配置的部署域名可以使用 Host 设置文档，未列入名单的远程来源仍保持内存模式。Host/Origin 信任与浏览器令牌认证不变。
