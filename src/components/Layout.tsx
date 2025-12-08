import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserCog,
    Calendar,
    ShoppingBag,
    PieChart
} from 'lucide-react';

export const Layout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Auto-close on resize if switching to desktop
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
        { to: '/clients', icon: Users, label: 'Clients' },
        { to: '/coaches', icon: UserCog, label: 'Coachs' },
        { to: '/planning', icon: Calendar, label: 'Planning' },
        { to: '/services', icon: ShoppingBag, label: 'Services' },
        { to: '/billing', icon: PieChart, label: 'Facturation' },
    ];

    return (
        <div className="app-layout relative">
            {/* Mobile Header / Toggle */}
            <div className="mobile-header md:hidden p-4 flex items-center justify-between bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">S</div>
                    <span className="font-bold text-lg text-secondary">SportSanté</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-secondary hover:bg-gray-100 rounded-md"
                >
                    {isMobileMenuOpen ? 'Fermer' : 'Menu'}
                </button>
            </div>

            {/* Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''} transition-transform duration-300`}>
                <div className="logo-container hidden md:flex">
                    <div className="brand-icon">S</div>
                    <span className="brand-text">SportSanté</span>
                </div>

                <div className="logo-container md:hidden flex justify-between items-center">
                    <span className="brand-text text-xl">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                        ✕
                    </button>
                </div>

                <nav className="nav-menu">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="user-profile mt-auto">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-md">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-bold">Admin</p>
                        <p className="text-xs text-text-muted">Gestionnaire</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content pt-20 md:pt-8 w-full">
                <div className="content-width animate-fadeIn px-4 md:px-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
