/**
 * BuffrSign App Layout Component
 * Main application layout with sidebar, header, and responsive design
 * Location: components/layout/AppLayout.tsx
 */

import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Menu, X, Sun, Moon, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const layoutVariants = cva(
  // Base styles
  "min-h-screen bg-gray-50",
  {
    variants: {
      variant: {
        default: "bg-gray-50",
        dark: "bg-slate-900",
      },
      sidebarCollapsed: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      sidebarCollapsed: false,
    },
  }
);

const sidebarVariants = cva(
  // Base styles
  "fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        dark: "bg-slate-800 border-slate-700",
      },
      collapsed: {
        true: "w-16",
        false: "w-64",
      },
      mobile: {
        true: "transform -translate-x-full",
        false: "transform translate-x-0",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsed: false,
      mobile: false,
    },
  }
);

const mainContentVariants = cva(
  // Base styles
  "transition-all duration-300 ease-in-out",
  {
    variants: {
      sidebarCollapsed: {
        true: "ml-16",
        false: "ml-64",
      },
      mobile: {
        true: "ml-0",
        false: "",
      },
    },
    defaultVariants: {
      sidebarCollapsed: false,
      mobile: false,
    },
  }
);

const headerVariants = cva(
  // Base styles
  "sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        dark: "bg-slate-800 border-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  current?: boolean;
  children?: NavigationItem[];
}

export interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface AppLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants> {
  children: React.ReactNode;
  navigation: NavigationItem[];
  user?: UserInfo;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: (collapsed: boolean) => void;
  onThemeToggle?: (theme: 'light' | 'dark') => void;
  onLogout?: () => void;
  containerClassName?: string;
  sidebarClassName?: string;
  headerClassName?: string;
  mainClassName?: string;
  footerClassName?: string;
}

const AppLayout = React.forwardRef<HTMLDivElement, AppLayoutProps>(
  ({ 
    className, 
    variant,
    children,
    navigation,
    user,
    title,
    breadcrumbs,
    actions,
    sidebar,
    header,
    footer,
    showSidebar = true,
    showHeader = true,
    showFooter = false,
    sidebarCollapsed = false,
    onSidebarToggle,
    onThemeToggle,
    onLogout,
    containerClassName,
    sidebarClassName,
    headerClassName,
    mainClassName,
    footerClassName,
    ...props 
  }, ref) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth >= 768) {
          setIsSidebarOpen(false);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle theme
    useEffect(() => {
      const savedTheme = localStorage.getItem('buffrsign-theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }, []);

    const handleThemeToggle = () => {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      document.documentElement.classList.toggle('dark', newTheme);
      localStorage.setItem('buffrsign-theme', newTheme ? 'dark' : 'light');
      onThemeToggle?.(newTheme ? 'dark' : 'light');
    };

    const handleSidebarToggle = () => {
      if (isMobile) {
        setIsSidebarOpen(!isSidebarOpen);
      } else {
        onSidebarToggle?.(!sidebarCollapsed);
      }
    };

    const handleLogout = () => {
      setIsUserMenuOpen(false);
      onLogout?.();
    };

    const renderSidebar = () => {
      if (!showSidebar) return null;

      return (
        <>
          {/* Mobile overlay */}
          {isMobile && isSidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              sidebarVariants({ 
                variant: isDarkMode ? 'dark' : 'default',
                collapsed: !isMobile && sidebarCollapsed,
                mobile: isMobile && !isSidebarOpen
              }),
              sidebarClassName
            )}
          >
            <div className="flex h-full flex-col">
              {/* Sidebar Header */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                {!sidebarCollapsed && !isMobile && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">B</span>
                    </div>
                    <span className="font-semibold text-gray-900">BuffrSign</span>
                  </div>
                )}
                
                {!isMobile && (
                  <button
                    onClick={handleSidebarToggle}
                    className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      {
                        "bg-brand-blue-50 text-brand-blue-700": item.current,
                        "text-gray-600 hover:text-gray-900 hover:bg-gray-50": !item.current,
                      }
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {(!sidebarCollapsed || isMobile) && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-blue-100 text-brand-blue-800">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </a>
                ))}
              </nav>

              {/* Sidebar Footer */}
              {user && (!sidebarCollapsed || isMobile) && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      );
    };

    const renderHeader = () => {
      if (!showHeader) return null;

      return (
        <header className={cn(headerVariants({ variant: isDarkMode ? 'dark' : 'default' }), headerClassName)}>
          <div className="flex h-16 items-center justify-between px-4">
            {/* Left side */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              {isMobile && showSidebar && (
                <button
                  onClick={handleSidebarToggle}
                  className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Title and breadcrumbs */}
              <div className="flex items-center gap-4">
                {title && (
                  <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                )}
                
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="flex items-center space-x-2 text-sm text-gray-500">
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <span>/</span>}
                        {crumb.href ? (
                          <a href={crumb.href} className="hover:text-gray-700">
                            {crumb.label}
                          </a>
                        ) : (
                          <span>{crumb.label}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Actions */}
              {actions && <div className="flex items-center gap-2">{actions}</div>}

              {/* Theme toggle */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                  </button>

                  {/* User dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <a
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </a>
                      <a
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </a>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          layoutVariants({ variant: isDarkMode ? 'dark' : 'default' }),
          containerClassName,
          className
        )}
        {...props}
      >
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main content */}
        <div className={cn(
          mainContentVariants({ 
            sidebarCollapsed: !isMobile && sidebarCollapsed,
            mobile: isMobile
          }),
          mainClassName
        )}>
          {/* Header */}
          {renderHeader()}

          {/* Page content */}
          <main className="flex-1 p-6">
            {children}
          </main>

          {/* Footer */}
          {showFooter && footer && (
            <footer className={cn("border-t border-gray-200 bg-white p-6", footerClassName)}>
              {footer}
            </footer>
          )}
        </div>

        {/* Notifications modal */}
        <Modal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          title="Notifications"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">No new notifications</p>
          </div>
        </Modal>
      </div>
    );
  }
);

AppLayout.displayName = "AppLayout";

export { AppLayout, layoutVariants };
