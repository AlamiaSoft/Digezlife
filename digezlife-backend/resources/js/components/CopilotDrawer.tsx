import * as React from 'react';
import { usePage } from '@inertiajs/react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    Bot,
    CheckCircle2,
    Copy,
    FileText,
    MessageSquare,
    Plane,
    Send,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';

interface CopilotDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contextEntity?: {
        type: string;
        id: string;
        name?: string;
    };
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    toolUsed?: string;
    actionCard?: {
        title: string;
        detail: string;
        actionLabel: string;
        badge?: string;
    };
    timestamp: string;
}

export function CopilotDrawer({
    open,
    onOpenChange,
    contextEntity = { type: 'Booking', id: 'BK-202609-00101', name: 'Acme Travels' },
}: CopilotDrawerProps) {
    const page = usePage<{
        tenant?: { id: string; name: string };
    }>();
    const tenantId = page.props.tenant?.id ?? 'acme';

    const [messages, setMessages] = React.useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'assistant',
            text: `Hello! I'm your TravelOS AI Copilot backed by live MCP domain tools. I can analyze bookings, check visa validity, inspect payments, or surface operational items needing your attention today.`,
            timestamp: 'Just now',
        },
    ]);
    const [inputValue, setInputValue] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(false);

    // Call live TravelOS MCP Server endpoint
    const callMcpTool = async (toolName: string, args: Record<string, any>) => {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/app/${tenantId}/travelos/copilot/mcp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method: 'tools/call',
                    params: {
                        name: toolName,
                        arguments: args,
                    },
                }),
            });

            if (!res.ok) throw new Error(`MCP Error ${res.status}`);
            const data = await res.json();
            return data.result?.data ?? null;
        } catch (err) {
            console.error('MCP Tool Call Error:', err);
            return null;
        }
    };

    const handleSend = async (textToSend?: string) => {
        const query = (textToSend || inputValue).trim();
        if (!query) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: query,
            timestamp: 'Just now',
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        const lower = query.toLowerCase();
        let toolName = 'travel.booking.summary';
        let toolArgs: Record<string, any> = { reference_no: contextEntity.id };

        if (lower.includes('attention') || lower.includes('urgent') || lower.includes('needs attention')) {
            toolName = 'travel.booking.attention';
            toolArgs = { limit: 5 };
        } else if (lower.includes('my work') || lower.includes('task') || lower.includes('today') || lower.includes('appointment')) {
            toolName = 'travel.operations.my_work';
            toolArgs = {};
        } else if (lower.includes('sales') || lower.includes('revenue') || lower.includes('performance')) {
            toolName = 'travel.sales.summary';
            toolArgs = { period: 'this_month' };
        } else if (lower.includes('visa') || lower.includes('passport')) {
            toolName = 'travel.visa.status';
            toolArgs = { passport_number: 'PA9876543' };
            if (lower.includes('zayd') || lower.includes('expire')) {
                toolArgs = { passport_number: 'P12345678' };
            }
        } else if (lower.includes('payment') || lower.includes('ledger') || lower.includes('balance') || lower.includes('outstanding')) {
            toolName = 'travel.payment.summary';
            toolArgs = { reference_no: contextEntity.id };
        } else if (lower.includes('activity') || lower.includes('timeline') || lower.includes('audit')) {
            toolName = 'travel.booking.activity';
            toolArgs = { reference_no: contextEntity.id };
        } else if (lower.includes('ahmed') || lower.includes('customer') || lower.includes('sarah') || lower.includes('zayd')) {
            toolName = 'travel.customer.summary';
            toolArgs = { query: lower.includes('zayd') ? 'Zayd' : (lower.includes('sarah') ? 'Sarah' : 'Ahmed') };
        }

        const data = await callMcpTool(toolName, toolArgs);

        let replyText = '';
        let actionCard: ChatMessage['actionCard'] = undefined;

        if (data) {
            if (toolName === 'travel.booking.attention') {
                const count = data.total_attention_items || 0;
                replyText = `Found ${count} operational attention item(s) requiring action today:`;
                const topItem = data.items?.[0];
                if (topItem) {
                    replyText += `\n\n• ${topItem.reason}\n• Suggested Action: ${topItem.suggested_action}`;
                    actionCard = {
                        title: `Critical Alert: ${topItem.type.replace(/_/g, ' ').toUpperCase()}`,
                        detail: `Booking: ${topItem.reference_no}\nCustomer: ${topItem.customer_name}\n${topItem.reason}`,
                        actionLabel: 'View Attention Manifest',
                        badge: topItem.severity,
                    };
                }
            } else if (toolName === 'travel.operations.my_work') {
                const appts = data.summary?.appointments_today_count || 0;
                const leads = data.summary?.open_leads_count || 0;
                replyText = `Here is your workload summary for today:\n• Scheduled Consultations: ${appts}\n• Open Leads Needing Follow-up: ${leads}`;
                if (data.today_appointments?.[0]) {
                    const appt = data.today_appointments[0];
                    actionCard = {
                        title: `Upcoming Consultation: ${appt.customer_name}`,
                        detail: `Time: ${appt.time} (${appt.duration_minutes} mins)\nType: ${appt.type.toUpperCase()}\nNotes: ${appt.notes}`,
                        actionLabel: 'Open Appointment Slip',
                    };
                }
            } else if (toolName === 'travel.sales.summary') {
                const vol = data.summary?.total_volume || 0;
                const coll = data.summary?.total_collected || 0;
                const out = data.summary?.outstanding_receivables || 0;
                replyText = `Sales metrics for this month:\n• Gross Booking Volume: $${vol.toLocaleString()}\n• Collected Revenue: $${coll.toLocaleString()}\n• Outstanding Receivables: $${out.toLocaleString()}`;
                actionCard = {
                    title: 'Monthly Revenue Card',
                    detail: `Total Bookings: ${data.summary?.total_bookings}\nConfirmed: ${data.summary?.confirmed_bookings}\nAverage Value: $${data.summary?.avg_booking_value}`,
                    actionLabel: 'Export Sales Sheet',
                };
            } else if (toolName === 'travel.visa.status') {
                const p = data.passport_assessment;
                replyText = `Passport & Visa Assessment for ${p?.traveler_name || 'Traveler'}:\n• Status: ${p?.passport_status?.toUpperCase()}\n• 6-Month Travel Valid: ${p?.valid_for_6m_international_travel ? 'YES' : 'NO'}\n• Guidance: ${p?.guidance}`;
                actionCard = {
                    title: 'Passport Validity Verification',
                    detail: `Passport: ${p?.passport_number}\nExpires in: ${p?.days_until_expiry} days\n${p?.guidance}`,
                    actionLabel: 'Copy Traveler Alert',
                    badge: p?.valid_for_6m_international_travel ? 'valid' : 'warning',
                };
            } else if (toolName === 'travel.customer.summary') {
                const c = data.customer;
                const fin = data.financial_summary;
                replyText = `Customer Profile: ${c?.name} (${c?.is_vip ? 'VIP' : 'Standard'})\n• Passport: ${c?.passport_number} (${c?.passport_status})\n• Lifetime Bookings: ${fin?.total_bookings_count}\n• Total Spent: $${fin?.total_spent}\n• Outstanding Balance: $${fin?.outstanding_balance}`;
                actionCard = {
                    title: `Customer Dossier: ${c?.name}`,
                    detail: `Email: ${c?.email}\nPhone: ${c?.phone}\nBranch: ${c?.branch_name}\nActive Bookings: ${fin?.active_bookings_count}`,
                    actionLabel: 'Copy Profile Summary',
                };
            } else if (toolName === 'travel.payment.summary') {
                const fin = data.financials;
                replyText = `Financial Ledger for ${data.reference_no || 'Booking'}:\n• Total Invoiced: $${fin?.total_amount}\n• Total Received: $${fin?.paid_amount}\n• Outstanding Due: $${fin?.outstanding_balance} (${fin?.is_fully_paid ? 'Fully Paid' : 'Balance Pending'})`;
                actionCard = {
                    title: 'Payment Summary Ledger',
                    detail: `Paid: $${fin?.paid_amount} / $${fin?.total_amount}\nTransactions Logged: ${data.payments_count}\nStatus: ${fin?.is_fully_paid ? 'Settled' : 'Pending Clearance'}`,
                    actionLabel: 'Generate Payment Link',
                };
            } else {
                const b = data.booking;
                const fin = data.financial;
                const blockers = data.action_blockers || [];
                replyText = `Booking #${b?.reference_no} (${b?.status?.toUpperCase()}):\n• Package: ${data.package?.name || 'Custom'}\n• Total: $${fin?.total_amount} | Paid: $${fin?.paid_amount}\n• Blockers: ${blockers.length > 0 ? blockers.join(', ') : 'None (Ready)'}`;
                actionCard = {
                    title: `Booking Summary #${b?.reference_no}`,
                    detail: `Customer: ${data.customer?.name}\nPax Count: ${b?.pax_count}\nDeparture: ${data.package?.departure_date || 'TBD'}\nTickets: ${data.operations?.ticketing_status}`,
                    actionLabel: 'Copy Itinerary Summary',
                };
            }
        } else {
            replyText = `I attempted to query the TravelOS MCP tool '${toolName}', but no records were returned. Please make sure the data is seeded for tenant '${tenantId}'.`;
        }

        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: replyText,
            toolUsed: toolName,
            actionCard,
            timestamp: 'Just now',
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
                <SheetHeader className="border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <SheetTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                    TravelOS Copilot
                                    <Badge variant="outline" className="text-2xs font-normal border-indigo-200 text-indigo-700 dark:text-indigo-400">
                                        MCP Connected
                                    </Badge>
                                </SheetTitle>
                                <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Tenant: <span className="font-semibold text-indigo-600">{tenantId}</span> • Context: <span className="font-medium text-slate-900 dark:text-slate-100">#{contextEntity.id}</span>
                                </SheetDescription>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                {/* Quick Prompts mapped to MCP tools */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap gap-1.5">
                    <button
                        onClick={() => handleSend('What needs my attention today?')}
                        className="inline-flex items-center gap-1 text-2xs font-medium px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                    >
                        <ShieldAlert className="h-3 w-3 text-rose-600" />
                        Attention Items
                    </button>
                    <button
                        onClick={() => handleSend('Show me my pending work today')}
                        className="inline-flex items-center gap-1 text-2xs font-medium px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                    >
                        <UserCheck className="h-3 w-3 text-indigo-600" />
                        My Work
                    </button>
                    <button
                        onClick={() => handleSend('How are sales doing this month?')}
                        className="inline-flex items-center gap-1 text-2xs font-medium px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                    >
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                        Sales Summary
                    </button>
                    <button
                        onClick={() => handleSend('What is the visa and passport status for Zayd?')}
                        className="inline-flex items-center gap-1 text-2xs font-medium px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                    >
                        <ShieldCheck className="h-3 w-3 text-amber-600" />
                        Visa & Passport Check
                    </button>
                </div>

                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 text-xs leading-relaxed ${
                                msg.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {msg.sender === 'assistant' && (
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold text-2xs">
                                    AI
                                </div>
                            )}
                            <div
                                className={`max-w-[85%] rounded-lg p-3 space-y-2.5 ${
                                    msg.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted/50 border border-border text-foreground'
                                }`}
                            >
                                <p className="whitespace-pre-line">{msg.text}</p>

                                {msg.toolUsed && (
                                    <div className="inline-flex items-center gap-1 text-3xs font-mono px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/50">
                                        <span>tool: {msg.toolUsed}</span>
                                    </div>
                                )}

                                {msg.actionCard && (
                                    <div className="rounded-md border border-indigo-200/80 bg-indigo-50/50 p-2.5 dark:border-indigo-900 dark:bg-indigo-950/40 text-foreground space-y-2">
                                        <div className="flex items-center justify-between text-2xs font-semibold text-indigo-700 dark:text-indigo-300">
                                            <span>{msg.actionCard.title}</span>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                                        </div>
                                        <div className="font-mono text-2xs bg-background/80 p-2 rounded border border-border/60 whitespace-pre-line">
                                            {msg.actionCard.detail}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full text-2xs h-7 bg-background hover:bg-accent gap-1.5"
                                            onClick={() => navigator.clipboard.writeText(msg.actionCard!.detail)}
                                        >
                                            <Copy className="h-3 w-3" />
                                            {msg.actionCard.actionLabel}
                                        </Button>
                                    </div>
                                )}
                                <span className="block text-3xs opacity-60 text-right">
                                    {msg.timestamp}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Bot className="h-4 w-4 animate-spin text-indigo-500" />
                            <span>Executing MCP tool & reasoning...</span>
                        </div>
                    )}
                </div>

                {/* Input Box */}
                <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/80 dark:bg-slate-950/80">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex items-center gap-2"
                    >
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask Copilot (e.g. 'What needs attention?', 'Check Zayd's visa')..."
                            className="text-xs h-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        />
                        <Button type="submit" size="sm" className="h-9 px-3 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={!inputValue.trim()}>
                            <Send className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                    <div className="mt-1.5 flex items-center justify-between text-3xs text-muted-foreground px-1">
                        <span>Press Enter to send</span>
                        <span>TravelOS MCP v1.0</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
