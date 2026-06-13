# Python编辑器扩展包

## 功能说明

提供 `/tx py` 命令，打开图形化Python编程界面。

## 安装

将此扩展包上传到 GitHub 仓库，然后在 MLTSF 中加载：

```bash
/ap py-editor <你的用户名> <你的仓库>
```

或者直接从本地加载：

```bash
/ap py-editor C:\Users\admin\Desktop\extensions\py-editor
```

## 使用方法

在终端输入以下命令之一：

- `/tx py`
- `tx py`

## 功能特性

- 显示Python编程界面
- 列出常用命令（print, if, for, while, def, class, import）
- 提供示例代码
- 美观的终端界面展示

## 故障排查

如果命令无法加载，请检查：

1. **检查控制台日志**：查看是否有错误信息
2. **检查扩展包路径**：确保文件路径正确
3. **重新加载扩展包**：使用 `/rm py-editor` 卸载后重新加载
4. **查看可用命令**：使用 `/lxe` 列出已加载的扩展包

## 文件结构

```
py-editor/
├── extension.json    # 扩展包配置
├── main.js           # 主脚本（包含命令注册）
└── README.md         # 说明文档（本文件）
```

## 版本信息

- 版本：1.0.0
- 作者：MLTSF
- 创建日期：2026-06-13
