(function() {
    'use strict';

    try {
        // 检查 ExtensionAPI 是否可用
        if (typeof ExtensionAPI === 'undefined') {
            console.error('[py-editor] ExtensionAPI 不可用');
            return;
        }

        console.log('[py-editor] 开始注册命令...');

        // 注册 /tx py 命令（带 / 前缀）
        ExtensionAPI.registerCommand('/tx py', {
            description: '打开图形化Python编程界面',
            handler: function(args, terminal) {
                try {
                    terminal.println('正在启动图形化Python编程界面...', 'info-line');
                    
                    // 创建图形化界面
                    const editorUI = {
                        title: 'Python编程编辑器',
                        theme: 'dark',
                        fontSize: 14,
                        lineHeight: 1.5,
                        commands: [
                            { name: 'print', description: '输出文本' },
                            { name: 'if', description: '条件判断' },
                            { name: 'for', description: '循环结构' },
                            { name: 'while', description: 'while循环' },
                            { name: 'def', description: '定义函数' },
                            { name: 'class', description: '定义类' },
                            { name: 'import', description: '导入模块' }
                        ],
                        examples: [
                            '# 示例1: 简单的Hello World',
                            'print("Hello, World!")',
                            '',
                            '# 示例2: 条件判断',
                            'name = "Python"',
                            'if name == "Python":',
                            '    print("Great!")',
                            '',
                            '# 示例3: 函数定义',
                            'def greet(name):',
                            '    return f"Hello, {name}!"',
                            'print(greet("User"))'
                        ]
                    };

                    // 在终端显示界面信息
                    terminal.println('╔══════════════════════════════════════════════════════════╗', 'success-line');
                    terminal.println('║        🐍 Python图形化编程编辑器                        ║', 'success-line');
                    terminal.println('╠══════════════════════════════════════════════════════════╣', 'success-line');
                    terminal.println('║  语言: Python 3.x                                        ║', 'info-line');
                    terminal.println('║  状态: 就绪                                              ║', 'success-line');
                    terminal.println('╠══════════════════════════════════════════════════════════╣', 'success-line');
                    terminal.println('║  快捷命令:                                              ║', 'info-line');
                    editorUI.commands.forEach(cmd => {
                        terminal.println(`    ${cmd.name.padEnd(10)} - ${cmd.description}`, 'info-line');
                    });
                    terminal.println('╠══════════════════════════════════════════════════════════╣', 'success-line');
                    terminal.println('║  示例代码:                                              ║', 'info-line');
                    editorUI.examples.forEach(line => {
                        terminal.println(`    ${line}`, 'info-line');
                    });
                    terminal.println('╚══════════════════════════════════════════════════════════╝', 'success-line');
                    
                    terminal.println('💡 提示: 此界面为演示版本，完整功能需要集成浏览器环境', 'warning-line');
                    terminal.println('📝 您可以在代码编辑器中编写Python代码并运行', 'info-line');
                } catch (err) {
                    console.error('[py-editor] 命令处理错误:', err);
                    terminal.println('错误: 无法启动图形化界面', 'error-line');
                }
            }
        });

        // 注册 tx py 命令（不带 / 前缀）
        ExtensionAPI.registerCommand('tx py', {
            description: '打开图形化Python编程界面（别名）',
            handler: function(args, terminal) {
                terminal.println('正在启动图形化Python编程界面...', 'info-line');
                
                const editorUI = {
                    title: 'Python编程编辑器',
                    theme: 'dark',
                    fontSize: 14,
                    lineHeight: 1.5,
                    commands: [
                        { name: 'print', description: '输出文本' },
                        { name: 'if', description: '条件判断' },
                        { name: 'for', description: '循环结构' },
                        { name: 'while', description: 'while循环' },
                        { name: 'def', description: '定义函数' },
                        { name: 'class', description: '定义类' },
                        { name: 'import', description: '导入模块' }
                    ],
                    examples: [
                        '# 示例1: 简单的Hello World',
                        'print("Hello, World!")',
                        '',
                        '# 示例2: 条件判断',
                        'name = "Python"',
                        'if name == "Python":',
                        '    print("Great!")',
                        '',
                        '# 示例3: 函数定义',
                        'def greet(name):',
                        '    return f"Hello, {name}!"',
                        'print(greet("User"))'
                    ]
                };

                terminal.println('╔══════════════════════════════════════════════════════════╗', 'success-line');
                terminal.println('║        🐍 Python图形化编程编辑器                        ║', 'success-line');
                terminal.println('╠══════════════════════════════════════════════════════════╣', 'success-line');
                terminal.println('║  语言: Python 3.x                                        ║', 'info-line');
                terminal.println('║  状态: 就绪                                              ║', 'success-line');
                terminal.println('╠══════════════════════════════════════════════════════════╣', 'success-line');
                terminal.println('║  快捷命令:                                              ║', 'info-line');
                editorUI.commands.forEach(cmd => {
                    terminal.println(`    ${cmd.name.padEnd(10)} - ${cmd.description}`, 'info-line');
                });
                terminal.println('╠══════════════════════════════════════════════════════════╣', 'success-line');
                terminal.println('║  示例代码:                                              ║', 'info-line');
                editorUI.examples.forEach(line => {
                    terminal.println(`    ${line}`, 'info-line');
                });
                terminal.println('╚══════════════════════════════════════════════════════════╝', 'success-line');
                
                terminal.println('💡 提示: 此界面为演示版本，完整功能需要集成浏览器环境', 'warning-line');
                terminal.println('📝 您可以在代码编辑器中编写Python代码并运行', 'info-line');
            }
        });

        console.log('[py-editor] 命令注册成功: /tx py');
    } catch (err) {
        console.error('[py-editor] 注册命令失败:', err);
    }
})();
