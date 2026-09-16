import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    Command as CommandIcon,
    Compass,
    CreditCard,
    FileText,
    Globe,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    Package,
    Plane,
    Search,
    Shield,
    ShieldCheck,
    Sparkles,
    Sun,
    User,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommandPalette } from '@/components/CommandPalette';
import { CopilotDrawer } from '@/components/CopilotDrawer';

interface WorkspaceLayoutProps {
    children: React.ReactNode;
    title?: string;
    currentModule?: string;
    contextEntity?: {
        type: string;
        id: string;
        name?: string;
    };
}

export default function WorkspaceLayout({
    children,
    title = 'Workspace',
    currentModule = 'travelos',
    contextEntity,
}: WorkspaceLayoutProps) {
    const page = usePage<{
        auth?: { user?: { name: string; email: string; avatar?: string } };
        tenant?: { id: string; name: string; plan?: string };
        activeModules?: string[];
        flash?: { success?: string; error?: string };
    }>();

    const user = page.props.auth?.user ?? { name: 'Ali Admin', email: 'admin@acme.com' };
    const tenant = page.props.tenant ?? { id: 'acme', name: 'Acme Travels (Kamal Express)', plan: 'Enterprise' };

    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [commandOpen, setCommandOpen] = React.useState(false);
    const [copilotOpen, setCopilotOpen] = React.useState(false);
    const [darkMode, setDarkMode] = React.useState(false);

    React.useEffect(() => {
        // Handle dark mode toggle
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const tenantPrefix = `/app/${tenant.id}`;

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Command Palette */}
            <CommandPalette
                open={commandOpen}
                setOpen={setCommandOpen}
                onOpenCopilot={() => setCopilotOpen(true)}
            />

            {/* AI Copilot Drawer */}
            <CopilotDrawer
                open={copilotOpen}
                onOpenChange={setCopilotOpen}
                contextEntity={contextEntity ?? { type: 'Travel Workspace', id: 'BK-202609-00101', name: tenant.name }}
            />

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
                }`}
            >
                {/* Logo & Tenant Header */}
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 font-bold text-white shadow-sm">
                            <Compass className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Alamia <span className="text-indigo-600 dark:text-indigo-400">SaaS</span>
                            </span>
                            <span className="text-2xs font-medium text-muted-foreground truncate max-w-[130px]">
                                {tenant.name}
                            </span>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-3xs uppercase font-mono px-1.5 py-0 border-indigo-200 text-indigo-700 dark:text-indigo-400">
                        {tenant.id}
                    </Badge>
                </div>

                {/* Search Quick Button */}
                <div className="p-3 border-b border-border/60">
                    <button
                        onClick={() => setCommandOpen(true)}
                        className="flex w-full items-center justify-between rounded-md border border-input bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Search className="h-3.5 w-3.5" />
                            Search (⌘K)...
                        </span>
                        <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-3xs font-medium text-muted-foreground opacity-100">
                            ⌘K
                        </kbd>
                    </button>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
                    {/* Main Core Navigation */}
                    <div>
                        <div className="px-2 pb-1.5 text-3xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>TravelOS Core</span>
                            <Badge className="text-3xs px-1 py-0 h-4 bg-emerald-100 text-emerald-800 border-emerald-200">Live</Badge>
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={`${tenantPrefix}/travelos`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <LayoutDashboard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                href={`${tenantPrefix}/travelos/sales`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Sales Management</span>
                            </Link>
                            <Link
                                href={`${tenantPrefix}/travelos/workspace`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <Globe className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                <span>Operations Workspace</span>
                            </Link>
                            <Link
                                href={`${tenantPrefix}/travelos/packages`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <Package className="h-4 w-4 text-purple-500" />
                                <span>Packages & Catalog</span>
                            </Link>
                            <Link
                                href={`${tenantPrefix}/travelos/customers`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <Users className="h-4 w-4 text-slate-500" />
                                <span>Customers Directory</span>
                            </Link>
                            <Link
                                href={`${tenantPrefix}/travelos/expenses`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <CreditCard className="h-4 w-4 text-rose-500" />
                                <span>Expense Management</span>
                            </Link>
                        </div>
                    </div>

                    {/* Operational Streams */}
                    <div>
                        <div className="px-2 pb-1.5 text-3xs font-bold uppercase tracking-wider text-muted-foreground">
                            Agency Desks
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={`${tenantPrefix}/travelos/workspace?tab=flights`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <Plane className="h-4 w-4 text-sky-500" />
                                <span>Flight PNRs & Tickets</span>
                            </Link>
                            <Link
                                href={`${tenantPrefix}/travelos/workspace?tab=visas`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span>Visa Processing</span>
                            </Link>
                            <Link
                                href={`${tenantPrefix}/travelos/workspace?tab=ledger`}
                                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <CreditCard className="h-4 w-4 text-amber-500" />
                                <span>Financial Ledgers</span>
                            </Link>
                        </div>
                    </div>

                    {/* Connected Modules (Ready for Expansion) */}
                    <div>
                        <div className="px-2 pb-1.5 text-3xs font-bold uppercase tracking-wider text-muted-foreground">
                            Connected Modules
                        </div>
                        <div className="space-y-0.5 text-muted-foreground/80">
                            <div className="flex items-center justify-between rounded-md px-2.5 py-1.5 hover:bg-muted/40 cursor-not-allowed">
                                <span className="flex items-center gap-2.5">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <span>Alamia Accounts</span>
                                </span>
                                <span className="text-3xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Ready</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md px-2.5 py-1.5 hover:bg-muted/40 cursor-not-allowed">
                                <span className="flex items-center gap-2.5">
                                    <UserCheck className="h-4 w-4 text-slate-400" />
                                    <span>Alamia CRM</span>
                                </span>
                                <span className="text-3xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Ready</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / User Badge */}
                <div className="border-t border-border p-3 space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-3xs font-medium text-muted-foreground">
                            Alamia SaaS v1.0
                        </span>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title="Toggle Light/Dark Theme"
                        >
                            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-2">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-2xs bg-indigo-100 text-indigo-700 font-bold">
                                {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate leading-tight">{user.name}</p>
                            <p className="text-3xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Top Nav Bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-1 text-muted-foreground hover:text-foreground lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-muted-foreground">Workspaces</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="font-bold text-foreground capitalize">{title}</span>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2.5">
                        {/* Copilot Action Trigger */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCopilotOpen(true)}
                            className="h-8 gap-1.5 text-xs border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="font-medium">Copilot</span>
                            <kbd className="hidden sm:inline-block text-3xs font-mono bg-white/80 dark:bg-black/40 px-1 py-0.5 rounded border border-indigo-200/60">
                                ⌘J
                            </kbd>
                        </Button>

                        {/* Search Trigger (Mobile/Tablet) */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => setCommandOpen(true)}
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground relative"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
                        </Button>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 px-1.5 gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-3xs bg-primary text-primary-foreground font-semibold">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs">
                                <DropdownMenuLabel>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-3xs font-normal text-muted-foreground">{user.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setCommandOpen(true)}>
                                    <CommandIcon className="mr-2 h-3.5 w-3.5" />
                                    <span>Command Palette</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCopilotOpen(true)}>
                                    <Sparkles className="mr-2 h-3.5 w-3.5 text-indigo-600" />
                                    <span>AI Assistant</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.post('/logout')} className="cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600">
                                    <LogOut className="mr-2 h-3.5 w-3.5" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Main Workspace Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
