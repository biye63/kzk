// py-tools/main.js - Python 便捷工具包

(function() {
    'use strict';

    // 获取终端对象的辅助函数（便于后续调用）
    function getTerminal() {
        return ExtensionAPI.getTerminal();
    }

    // 执行 Python 代码的核心函数（通过终端运行命令）
    function executePythonCode(code, terminal, onSuccess, onError) {
        if (!code || code.trim() === '') {
            terminal.println('错误: 未提供 Python 代码', 'error-line');
            return false;
        }

        // 转义双引号和反斜杠，以便安全传递给 python -c
        const escapedCode = code.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const command = `python -c "${escapedCode}"`;

        terminal.println(`>>> 执行: ${code}`, 'info-line');

        // 假设终端提供了 runCommand 方法执行系统命令并捕获输出
        // 若 MLTSF 未提供此方法，则会降级提示
        if (typeof terminal.runCommand === 'function') {
            terminal.runCommand(command, {
                onOutput: (output) => terminal.println(output, ''),
                onError: (err) => terminal.println(err, 'error-line'),
                onComplete: () => terminal.println('执行完成', 'success-line')
            });
        } else {
            terminal.println('警告: 当前终端不支持 runCommand，无法直接执行 Python 代码。', 'warning-line');
            terminal.println('建议: 请手动复制以下命令到系统终端执行：', 'info-line');
            terminal.println(command, 'info-line');
        }
        return true;
    }

    // ----------------------------- 注册 /py 命令 -----------------------------
    ExtensionAPI.registerCommand('py', {
        description: '执行 Python 代码，用法: /py <代码>  或  /py run <代码>',
        handler: function(args, terminal) {
            if (args.length === 0) {
                terminal.println('用法:', 'info-line');
                terminal.println('  /py <一行Python代码>        例如: /py print("Hello")', '');
                terminal.println('  /py run <一行Python代码>    例如: /py run 1+2', '');
                terminal.println('  /py help                   显示本帮助', '');
                return;
            }

            // 处理 help
            if (args[0] === 'help') {
                terminal.println('Python 快速执行器', 'success-line');
                terminal.println('使用 python -c 在后台执行代码，支持所有 Python 语法。', '');
                terminal.println('示例:', 'info-line');
                terminal.println('  /py print(sum(range(10)))   # 输出 45', '');
                terminal.println('  /py import math; print(math.pi)', '');
                terminal.println('注意: 代码需写在一行内，使用分号分隔多条语句。', 'warning-line');
                return;
            }

            // 处理 run 前缀
            let code = args.join(' ');
            if (args[0] === 'run') {
                code = args.slice(1).join(' ');
            }
            executePythonCode(code, terminal);
        }
    });

    // ----------------------------- 注册 /pyfile 命令 -----------------------------
    ExtensionAPI.registerCommand('pyfile', {
        description: '执行项目中的 .py 文件，用法: /pyfile <文件名> [参数...]',
        handler: function(args, terminal) {
            if (args.length === 0) {
                terminal.println('用法: /pyfile <文件名> [命令行参数]', 'info-line');
                terminal.println('示例: /pyfile script.py', '');
                terminal.println('      /pyfile test.py --verbose', '');
                return;
            }

            const fileName = args[0];
            const fileArgs = args.slice(1).join(' ');
            const command = `python ${fileName} ${fileArgs}`;

            terminal.println(`>>> 运行脚本: ${fileName}`, 'info-line');
            if (typeof terminal.runCommand === 'function') {
                terminal.runCommand(command, {
                    onOutput: (output) => terminal.println(output, ''),
                    onError: (err) => terminal.println(err, 'error-line'),
                    onComplete: () => terminal.println('脚本执行完毕', 'success-line')
                });
            } else {
                terminal.println('当前终端不支持直接执行脚本，请手动运行：', 'warning-line');
                terminal.println(command, 'info-line');
            }
        }
    });

    // ----------------------------- 注册 /pyversion 命令 -----------------------------
    ExtensionAPI.registerCommand('pyversion', {
        description: '显示当前 Python 版本信息',
        handler: function(args, terminal) {
            terminal.println('正在获取 Python 版本...', 'info-line');
            if (typeof terminal.runCommand === 'function') {
                terminal.runCommand('python --version', {
                    onOutput: (output) => terminal.println(output, 'success-line'),
                    onError: (err) => terminal.println(err, 'error-line')
                });
            } else {
                terminal.println('无法直接查询，请在系统终端执行: python --version', 'warning-line');
            }
        }
    });

    // ----------------------------- 注册 /pyenv 命令 -----------------------------
    ExtensionAPI.registerCommand('pyenv', {
        description: '显示 Python 环境信息（路径、已安装包等）',
        handler: function(args, terminal) {
            terminal.println('=== Python 环境信息 ===', 'success-line');
            if (typeof terminal.runCommand === 'function') {
                terminal.runCommand('python -c "import sys, os; print(f\'可执行文件: {sys.executable}\\\\n版本: {sys.version}\\\\n路径: {os.getcwd()}\')"', {
                    onOutput: (output) => terminal.println(output, ''),
                    onError: (err) => terminal.println(err, 'error-line')
                });
                terminal.runCommand('pip list --format=freeze | head -10', {
                    onOutput: (output) => terminal.println('已安装包（前10个）:\n' + output, 'info-line'),
                    onError: () => terminal.println('无法列出 pip 包，请检查 pip 是否可用', 'warning-line')
                });
            } else {
                terminal.println('无法获取完整环境信息，请手动执行相关 Python 命令', 'warning-line');
            }
        }
    });

    // 可选：提供一个快捷别名 /python 指向 /py
    if (typeof ExtensionAPI.registerAlias === 'function') {
        ExtensionAPI.registerAlias('python', 'py');
    }

    console.log('[py-tools] Python 便捷工具包已加载，使用 /py help 查看帮助');
})();