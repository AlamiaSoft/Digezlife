import * as React from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import {
    Calendar,
    CreditCard,
    FileText,
    Globe,
    Layers,
    Package,
    Plane,
    PlusCircle,
    Search,
    ShieldCheck,
    Sparkles,
    UserPlus,
    Users,
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

interface CommandPaletteProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onOpenCopilot?: () => void;
}

export function CommandPalette({ open, setOpen, onOpenCopilot }: CommandPaletteProps) {
    const { tenant } = usePage<{ tenant: { id: string; name: string } }>().props;
    const tenantId = tenant?.id ?? 'acme';

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(!open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, setOpen]);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, [setOpen]);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search entities (bookings, customers, packages)..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="AI Actions">
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => {
                                onOpenCopilot?.();
                            })
                        }
                    >
                        <Sparkles className="mr-2 h-4 w-4 text-indigo-500" />
                        <span>Ask TravelOS Copilot</span>
                        <CommandShortcut>⌘J</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/workspace`)
                            )
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>New Tour Booking</span>
                        <CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/customers`)
                            )
                        }
                    >
                        <UserPlus className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Add Customer Record</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/workspace?tab=ledger`)
                            )
                        }
                    >
                        <CreditCard className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Record Payment Voucher</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="TravelOS Workspaces">
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/workspace`)
                            )
                        }
                    >
                        <Globe className="mr-2 h-4 w-4 text-indigo-500" />
                        <span>Booking Operational Workspace (#BK-202609-00101)</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/packages`)
                            )
                        }
                    >
                        <Package className="mr-2 h-4 w-4 text-purple-500" />
                        <span>Umrah & Tour Packages Catalog</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/customers`)
                            )
                        }
                    >
                        <Users className="mr-2 h-4 w-4 text-slate-500" />
                        <span>Customers & Pilgrims Directory</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Operations & Processing">
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/workspace?tab=flights`)
                            )
                        }
                    >
                        <Plane className="mr-2 h-4 w-4 text-sky-500" />
                        <span>Flight Inventory & PNR Tickets</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/workspace?tab=visas`)
                            )
                        }
                    >
                        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>Visa Application Tracker</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit(`/app/${tenantId}/travelos/workspace?tab=ledger`)
                            )
                        }
                    >
                        <FileText className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Accounts & Financial Invoices</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
