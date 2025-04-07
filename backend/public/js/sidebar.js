// Sidebar functionality
function initializeSidebar() {
    try {
        console.log('Initializing sidebar...');
        
        // Set active page
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard';
        const activePage = document.querySelector(`[data-page="${currentPage}"]`);
        if (activePage) {
            activePage.classList.add('active');
            console.log('Set active page:', currentPage);
        }

        // Get sidebar element
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            console.error('Sidebar element not found');
            return;
        }

        // 获取dashboard容器
        const dashboardContainer = document.querySelector('.dashboard-container');

        // Restore sidebar state - 支持两种localStorage键名
        let sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        // 如果旧键名存在，优先使用旧键名的值，并更新到新键名
        if (localStorage.getItem('sidebar-collapsed') !== null) {
            sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
            localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
        }
        
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            // 同时更新dashboard容器状态
            if (dashboardContainer) {
                dashboardContainer.classList.add('sidebar-collapsed');
            }
            console.log('Restored sidebar collapsed state');
        }

        // 确保侧边栏切换按钮正确工作
        const toggleButton = sidebar.querySelector('.sidebar-toggle');
        if (toggleButton) {
            // 移除现有的onclick属性
            toggleButton.removeAttribute('onclick');
            // 添加新的事件监听器
            toggleButton.addEventListener('click', function(e) {
                toggleSidebar(e);
            });
            console.log('Sidebar toggle button initialized');
        }

        // Add window resize handler
        window.addEventListener('resize', handleResize);
        console.log('Added resize handler');

        // Add click outside handler for mobile
        document.addEventListener('click', handleClickOutside);
        console.log('Added click outside handler');

        // Initial update of toggle icon
        updateToggleIcon();
        console.log('Sidebar initialization complete');
    } catch (error) {
        console.error('Error initializing sidebar:', error);
    }
}

function toggleSidebar(event) {
    try {
        // 如果事件来自非按钮元素，不执行任何操作
        if (event && !event.target.closest('.sidebar-toggle')) {
            console.log('Toggle attempt ignored: not from toggle button');
            return;
        }

        const sidebar = document.querySelector('.sidebar');
        const dashboardContainer = document.querySelector('.dashboard-container');
        
        if (!sidebar) {
            console.error('Sidebar element not found');
            return;
        }

        // 切换侧边栏折叠状态
        sidebar.classList.toggle('collapsed');
        
        // 更新dashboard容器状态
        if (dashboardContainer) {
            dashboardContainer.classList.toggle('sidebar-collapsed');
        }
        
        // 保存状态到localStorage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        // 为了兼容旧页面，同时保存到旧的键名
        localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        
        // 更新图标
        updateToggleIcon();
        
        // 阻止事件冒泡和默认行为
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        console.log('Sidebar toggled:', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
    } catch (error) {
        console.error('Error toggling sidebar:', error);
    }
}

function handleResize() {
    try {
        updateToggleIcon();
    } catch (error) {
        console.error('Error handling resize:', error);
    }
}

function handleClickOutside(e) {
    try {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            return;
        }

        const isMobile = window.innerWidth <= 768;
        
        if (isMobile && sidebar.classList.contains('collapsed')) {
            // Check if click is outside sidebar
            if (!sidebar.contains(e.target) && !e.target.closest('.sidebar-toggle')) {
                sidebar.classList.remove('collapsed');
                updateToggleIcon();
            }
        }
    } catch (error) {
        console.error('Error handling click outside:', error);
    }
}

function updateToggleIcon() {
    try {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            console.error('Sidebar element not found');
            return;
        }

        const icon = sidebar.querySelector('.sidebar-toggle i');
        if (!icon) {
            console.error('Toggle icon element not found');
            return;
        }

        const isMobile = window.innerWidth <= 768;
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        icon.className = `fas fa-chevron-${isMobile ? (isCollapsed ? 'left' : 'right') : (isCollapsed ? 'right' : 'left')}`;
    } catch (error) {
        console.error('Error updating toggle icon:', error);
    }
}

// Theme functionality
function initializeTheme() {
    try {
        console.log('Initializing theme...');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon();
        console.log('Theme initialized:', savedTheme);
    } catch (error) {
        console.error('Error initializing theme:', error);
    }
}

function toggleTheme() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
        
        // Dispatch event for pages that need to update their theme-dependent elements
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
        console.log('Theme toggled to:', newTheme);
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

function updateThemeIcon() {
    try {
        const themeIcon = document.querySelector('.theme-switch i');
        const themeText = document.querySelector('.theme-switch span');
        
        if (!themeIcon || !themeText) {
            console.error('Theme switch elements not found');
            return;
        }

        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Set the data-i18n attribute for potential future translations
        themeText.setAttribute('data-i18n', currentTheme === 'dark' ? 'dark_mode' : 'light_mode');
        
        // Set the text content directly
        themeText.textContent = window.i18n ? 
            window.i18n.t(currentTheme === 'dark' ? 'dark_mode' : 'light_mode') :
            (currentTheme === 'dark' ? 'Dark mode' : 'Light mode');
    } catch (error) {
        console.error('Error updating theme icon:', error);
    }
}

// Wait for DOM and sidebar template to load
function waitForSidebar() {
    return new Promise((resolve) => {
        function check() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        }
        check();
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM loaded, waiting for sidebar...');
        await waitForSidebar();
        console.log('Sidebar found, initializing...');
        initializeSidebar();
        initializeTheme();
        
        // 添加导航链接点击事件处理
        setupNavLinks();
        
        // 添加侧边栏点击处理，防止点击侧边栏区域触发折叠/展开
        preventSidebarToggleOnClick();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// 设置导航链接点击事件处理
function setupNavLinks() {
    try {
        const navLinks = document.querySelectorAll('.sidebar .nav-item');
        navLinks.forEach(link => {
            // 移除现有的onclick属性
            link.removeAttribute('onclick');
            
            // 添加新的点击事件监听器
            link.addEventListener('click', function(e) {
                // 阻止事件冒泡，避免触发侧边栏折叠
                e.stopPropagation();
                
                // 如果点击的是当前页面，则不跳转
                if (link.classList.contains('active')) {
                    e.preventDefault();
                    return;
                }
                
                // 正常导航到目标页面
                console.log('Navigating to:', link.getAttribute('href'));
            });
        });
        
        // 同样处理主题切换按钮
        const themeSwitch = document.querySelector('.theme-switch');
        if (themeSwitch) {
            // 移除现有的onclick属性
            themeSwitch.removeAttribute('onclick');
            // 添加新的事件监听器
            themeSwitch.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                toggleTheme();
            });
        }
        
        console.log('Navigation links setup complete');
    } catch (error) {
        console.error('Error setting up navigation links:', error);
    }
}

// 阻止点击侧边栏区域触发折叠/展开
function preventSidebarToggleOnClick() {
    try {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            console.error('Sidebar element not found for click prevention');
            return;
        }
        
        // 为侧边栏的每个元素添加点击事件处理
        const sidebarElements = sidebar.querySelectorAll('*:not(.sidebar-toggle)');
        sidebarElements.forEach(element => {
            if (!element.closest('.sidebar-toggle')) {
                element.addEventListener('click', function(e) {
                    // 确保点击事件不会冒泡到影响侧边栏折叠状态
                    e.stopPropagation();
                });
            }
        });
        
        // 移除所有页面上的onclick属性形式的toggleSidebar调用
        document.querySelectorAll('[onclick*="toggleSidebar"]').forEach(element => {
            if (!element.classList.contains('sidebar-toggle')) {
                element.removeAttribute('onclick');
            }
        });
        
        console.log('Sidebar click prevention setup complete');
    } catch (error) {
        console.error('Error setting up sidebar click prevention:', error);
    }
} 