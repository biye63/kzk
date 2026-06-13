(function() {
    const api = window.ExtensionAPI;

    // 当前编辑的文件名
    let currentFile = null;
    // 当前面板实例
    let currentPanel = null;

    // 辅助函数：转义HTML（防止注入）
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // 获取当前项目的Python文件列表
    async function getPythonFiles() {
        const files = api.listFiles();
        if (!files || !files.length) return [];
        return files.filter(f => f.endsWith('.py'));
    }

    // 渲染文件列表
    function renderFileList(files, container, onFileClick) {
        container.innerHTML = '';
        if (files.length === 0) {
            container.innerHTML = '<div class="py-editor-empty">暂无 .py 文件，点击“新建文件”创建</div>';
            return;
        }
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'py-editor-file-item';
            if (currentFile === file) item.classList.add('active');
            item.innerHTML = `
                <span class="py-editor-file-name">📄 ${escapeHtml(file)}</span>
                <button class="py-editor-file-del" data-file="${escapeHtml(file)}">🗑️</button>
            `;
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('py-editor-file-del')) return;
                onFileClick(file);
            });
            const delBtn = item.querySelector('.py-editor-file-del');
            delBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const confirmed = await api.showDialog({
                    title: '确认删除',
                    message: `确定要删除文件 ${file} 吗？`,
                    type: 'confirm'
                });
                if (confirmed) {
                    // 删除文件：写入空内容覆盖（SDK没有直接删除API，用空内容覆盖模拟，实际可请求后端）
                    // 更好的方式是调用终端命令删除，但为了简单，覆盖空内容
                    api.writeFile(file, '');
                    // 刷新界面
                    if (currentFile === file) {
                        currentFile = null;
                    }
                    refreshUI();
                }
            });
            container.appendChild(item);
        });
    }

    // 刷新整个编辑器界面
    async function refreshUI() {
        if (!currentPanel) return;
        const files = await getPythonFiles();
        const fileListDiv = currentPanel.content.querySelector('.py-editor-file-list-body');
        const editorTextarea = currentPanel.content.querySelector('.py-editor-textarea');
        const fileNameSpan = currentPanel.content.querySelector('.py-editor-current-file');
        const runBtn = currentPanel.content.querySelector('.py-editor-run-btn');
        const saveBtn = currentPanel.content.querySelector('.py-editor-save-btn');

        if (fileListDiv) {
            renderFileList(files, fileListDiv, async (file) => {
                // 加载文件内容
                const content = api.readFile(file);
                if (content !== null) {
                    currentFile = file;
                    editorTextarea.value = content;
                    fileNameSpan.textContent = `当前文件：${file}`;
                    refreshUI(); // 重新渲染以高亮当前文件
                } else {
                    api.print(`读取文件 ${file} 失败`, 'error-line');
                }
            });
        }

        // 如果没有当前文件且存在文件列表，自动加载第一个
        if (!currentFile && files.length > 0) {
            const firstFile = files[0];
            const content = api.readFile(firstFile);
            if (content !== null) {
                currentFile = firstFile;
                editorTextarea.value = content;
                fileNameSpan.textContent = `当前文件：${firstFile}`;
            }
        } else if (!currentFile && files.length === 0) {
            editorTextarea.value = '';
            fileNameSpan.textContent = '当前文件：无';
        }

        // 更新按钮状态
        if (runBtn) runBtn.disabled = !currentFile;
        if (saveBtn) saveBtn.disabled = !currentFile;
    }

    // 保存当前文件
    async function saveCurrentFile() {
        if (!currentFile) {
            api.showDialog({ title: '提示', message: '没有打开的文件，请先新建或选择一个文件', type: 'alert' });
            return false;
        }
        const editorTextarea = currentPanel.content.querySelector('.py-editor-textarea');
        const content = editorTextarea.value;
        const success = api.writeFile(currentFile, content);
        if (success) {
            api.print(`文件 ${currentFile} 保存成功`, 'success-line');
            // 可选显示提示
            const saveHint = currentPanel.content.querySelector('.py-editor-save-hint');
            if (saveHint) {
                saveHint.style.opacity = '1';
                setTimeout(() => { saveHint.style.opacity = '0'; }, 1500);
            }
            return true;
        } else {
            api.print(`保存 ${currentFile} 失败`, 'error-line');
            return false;
        }
    }

    // 运行当前文件
    async function runCurrentFile() {
        if (!currentFile) {
            api.showDialog({ title: '提示', message: '没有可运行的文件', type: 'alert' });
            return;
        }
        // 先保存
        const saved = await saveCurrentFile();
        if (!saved) return;

        // 检查当前环境是否为Python
        const env = api.getCurrentEnv();
        if (env !== 'python') {
            const confirmSwitch = await api.showDialog({
                title: '环境提示',
                message: '当前环境不是 Python，是否自动切换到 Python 环境？',
                type: 'confirm'
            });
            if (confirmSwitch) {
                await api.executeCommand('/hj python');
                api.print('已切换到 Python 环境', 'info-line');
            } else {
                api.print('请在 Python 环境下运行 Python 文件', 'warning-line');
                return;
            }
        }

        api.print(`▶️ 正在运行 ${currentFile} ...`, 'info-line');
        // 执行运行命令
        await api.executeCommand(`/run ${currentFile}`);
        api.print(`✅ 运行结束`, 'success-line');
    }

    // 新建文件
    async function newFile() {
        const fileName = await api.showDialog({
            title: '新建Python文件',
            message: '请输入文件名（以 .py 结尾）：',
            type: 'prompt',
            inputPlaceholder: '例如: script.py'
        });
        if (!fileName) return;
        if (!fileName.endsWith('.py')) {
            api.showDialog({ title: '错误', message: '文件名必须以 .py 结尾', type: 'alert' });
            return;
        }
        // 检查是否已存在
        const files = await getPythonFiles();
        if (files.includes(fileName)) {
            api.showDialog({ title: '错误', message: `文件 ${fileName} 已存在`, type: 'alert' });
            return;
        }
        const success = api.writeFile(fileName, '# 新文件\nprint("Hello, MLTSF!")\n');
        if (success) {
            api.print(`新建文件 ${fileName} 成功`, 'success-line');
            currentFile = fileName;
            refreshUI();
        } else {
            api.print(`新建文件失败`, 'error-line');
        }
    }

    // 删除当前文件（额外快捷方式）
    async function deleteCurrentFile() {
        if (!currentFile) return;
        const confirmed = await api.showDialog({
            title: '确认删除',
            message: `确定要删除当前文件 ${currentFile} 吗？`,
            type: 'confirm'
        });
        if (confirmed) {
            api.writeFile(currentFile, '');
            currentFile = null;
            refreshUI();
            api.print(`已删除文件`, 'info-line');
        }
    }

    // 主界面创建
    async function openEditor() {
        if (currentPanel) {
            currentPanel.close();
            currentPanel = null;
            return;
        }

        const htmlContent = `
            <div class="py-editor-container">
                <div class="py-editor-sidebar">
                    <div class="py-editor-sidebar-header">
                        📁 Python 文件
                        <button class="py-editor-new-btn" title="新建文件">➕ 新建</button>
                    </div>
                    <div class="py-editor-file-list-body">
                        <!-- 动态列表 -->
                    </div>
                    <div class="py-editor-sidebar-footer">
                        <span class="py-editor-env-badge" id="py-env-badge">⚙️ 环境检测中...</span>
                    </div>
                </div>
                <div class="py-editor-main">
                    <div class="py-editor-toolbar">
                        <span class="py-editor-current-file">当前文件：无</span>
                        <div class="py-editor-actions">
                            <button class="py-editor-save-btn ext-btn" disabled>💾 保存</button>
                            <button class="py-editor-run-btn ext-btn" disabled>▶️ 运行</button>
                            <button class="py-editor-del-btn ext-btn danger" disabled>🗑️ 删除</button>
                        </div>
                    </div>
                    <textarea class="py-editor-textarea" placeholder="在此编写 Python 代码..."></textarea>
                    <div class="py-editor-save-hint">✅ 已保存</div>
                </div>
            </div>
        `;

        currentPanel = api.createUI(htmlContent, {
            title: '🐍 Python 图形化编程界面',
            width: 90,
            closable: true
        });

        // 绑定事件
        const container = currentPanel.content;
        const newBtn = container.querySelector('.py-editor-new-btn');
        const saveBtn = container.querySelector('.py-editor-save-btn');
        const runBtn = container.querySelector('.py-editor-run-btn');
        const delBtn = container.querySelector('.py-editor-del-btn');
        const textarea = container.querySelector('.py-editor-textarea');
