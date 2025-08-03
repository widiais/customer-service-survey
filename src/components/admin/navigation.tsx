'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Store, FileText, HelpCircle, LogOut, Plus, Users, Tag, ChevronRight, BarChart3, ClipboardList, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/stores', label: 'Toko', icon: Store },
  {
    href: '/dashboard/survey',
    label: 'Survey',
    icon: FileText,
    submenu: [
      { href: '/dashboard/survey/results', label: 'Hasil Survey', icon: ClipboardList },
      { href: '/dashboard/survey/analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },
  {
    href: '/dashboard/questions',
    label: 'Pertanyaan',
    icon: HelpCircle,
    submenu: [
      { href: '/dashboard/questions/create', label: 'Buat Pertanyaan', icon: Plus },
      { href: '/dashboard/questions/groups', label: 'Grup Pertanyaan', icon: Users },
      { href: '/dashboard/questions/categories', label: 'Kategori', icon: Tag },
      { href: '/dashboard/questions/collection', label: 'Koleksi', icon: Tag },
    ]
  },
];

interface NavigationProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Navigation({ isMobileMenuOpen = false, onMobileMenuToggle }: NavigationProps) {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(
    pathname.startsWith('/dashboard/questions') ? '/dashboard/questions' :
    pathname.startsWith('/dashboard/survey') ? '/dashboard/survey' : null
  );

  const toggleMenu = (href: string) => {
    setExpandedMenu(expandedMenu === href ? null : href);
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onMobileMenuToggle && isMobileMenuOpen) {
      onMobileMenuToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileMenuToggle}
        />
      )}
      
      {/* Sidebar */}
      <nav className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 h-screen transform transition-transform duration-300 ease-in-out lg:transform-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Labbaik Chicken</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        
        <div className="px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenu === item.href;
            const isParentActive = pathname.startsWith(item.href + '/');
            
            return (
              <div key={item.href}>
                {hasSubmenu ? (
                  <Button
                    variant={isParentActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isParentActive && 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    )}
                    onClick={() => toggleMenu(item.href)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                    <ChevronRight className={cn(
                      'ml-auto h-4 w-4 transition-transform',
                      isExpanded && 'rotate-90'
                    )} />
                  </Button>
                ) : (
                  <Link href={item.href} onClick={handleLinkClick}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        isActive && 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )}
                
                {hasSubmenu && isExpanded && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.submenu!.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href;
                      
                      return (
                        <Link key={subItem.href} href={subItem.href} onClick={handleLinkClick}>
                          <Button
                            variant={isSubActive ? 'default' : 'ghost'}
                            size="sm"
                            className={cn(
                              'w-full justify-start',
                              isSubActive && 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            )}
                          >
                            <SubIcon className="mr-2 h-3 w-3" />
                            {subItem.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>
    </>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-30 bg-white shadow-md border"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}