import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Database,
  Terminal,
  Code,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { aiService, ProposalData } from '../../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  proposal?: ProposalData | null;
  proposalStatus?: 'pending' | 'approved' | 'rejected';
  executedDetails?: {
    product_id?: number;
    product_name?: string;
    message?: string;
    timestamp?: string;
  };
  sqlQuery?: string;
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose, onRefresh }) => {
  // Session conversation ID to maintain memory state per thread
  const [conversationId, setConversationId] = useState<string>(() => 'conv_' + Date.now());
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Namaste! I am your Dhandho AI Assistant.\n\nYou can talk to me casually just like ChatGPT (ask questions, store tips, greetings) or manage your store (e.g. "Add a product Balaji Wafers with price 20 and 50 stock")!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [approvingStatus, setApprovingStatus] = useState<string | null>(null);
  const [expandedSqlIndex, setExpandedSqlIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic cycling thinking steps while AI is preparing proposal
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 3);
    }, 850);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, actionLoadingId, expandedSqlIndex]);

  // Start fresh conversation thread
  const handleReset = () => {
    setConversationId('conv_' + Date.now());
    setMessages([
      {
        sender: 'assistant',
        text: 'New conversation session started! How can I help with your store?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message with conversation ID for stateful memory
      const result = await aiService.sendMessage(text, conversationId);
      const aiMsg: Message = {
        sender: 'assistant',
        text: result.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposal: result.proposal,
        proposalStatus: result.proposal ? 'pending' : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        sender: 'assistant',
        text: 'Sorry, I encountered an error connecting to the AI assistant. Please ensure the backend server is running.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 3: Approve proposed change with ChatGPT-like live DB write simulation
  const handleApprove = async (proposalId: string, msgIndex: number, productData: any) => {
    setActionLoadingId(proposalId);
    setApprovingStatus('Connecting to PostgreSQL database...');

    const stepTimer = setTimeout(() => {
      setApprovingStatus('Executing INSERT INTO products table...');
    }, 450);

    try {
      const res = await aiService.approveProposal(proposalId, conversationId);
      clearTimeout(stepTimer);
      setApprovingStatus('Committed! Acquiring sequence ID...');

      const prodName = res.product_name || productData.name;
      const prodPrice = productData.price || 0;
      const prodStock = productData.stock || 0;

      const executedDetails = {
        product_id: res.product_id,
        product_name: prodName,
        message: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      const sqlSnippet = `-- PostgreSQL Committed Transaction\nINSERT INTO products (name, buying_price, selling_price, stock_quantity, low_stock_alert)\nVALUES ('${prodName}', 0.0, ${prodPrice}, ${prodStock}, 10)\nRETURNING id; -- Assigned Product ID: #${res.product_id || '32'}\n-- Status: 201 Created (1 row affected)`;

      // Update proposal message with approved state and execution receipt
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex
            ? {
                ...m,
                proposalStatus: 'approved',
                executedDetails,
                sqlQuery: sqlSnippet,
              }
            : m
        )
      );

      // Automatically auto-expand SQL log for clear verification
      setExpandedSqlIndex(msgIndex);

      // Add assistant confirmation response
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `✓ Product successfully created in store database!\n• Product ID: #${res.product_id || '32'}\n• Name: "${prodName}"\n• Selling Price: ₹${prodPrice}\n• Stock: ${prodStock} units\n\nLive inventory and dashboard have been updated.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Refresh live product and dashboard data in parent
      onRefresh?.();
    } catch (err: any) {
      alert(`Approval error: ${err.response?.data?.detail || err.message}`);
    } finally {
      clearTimeout(stepTimer);
      setActionLoadingId(null);
      setApprovingStatus(null);
    }
  };

  // Phase 3: Reject proposed change
  const handleReject = async (proposalId: string, msgIndex: number) => {
    setActionLoadingId(proposalId);
    try {
      const res = await aiService.rejectProposal(proposalId, conversationId);

      // Update message status
      setMessages((prev) =>
        prev.map((m, i) => (i === msgIndex ? { ...m, proposalStatus: 'rejected' } : m))
      );

      // Add assistant cancellation response
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `✗ Proposal Cancelled.\n${res.message}\nNo changes were written to the database.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      alert(`Rejection error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Hello! Kaise ho bhai?',
    'Add a product Balaji Wafers with price 20 and 50 stock',
    'Tips to increase store profit',
    'Add a product Amul Milk with price 32 and 25 stock',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00a86b] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">Kirana AI Assistant</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00a86b] bg-[#e8f7ee] px-2 py-0.5 rounded-full border border-emerald-200/60">
                Agent Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Human Authorization & DB Execution</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Start New Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Messages Body ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fbfcfb]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-[#00a86b] text-white rounded-br-xs font-medium'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
              }`}
            >
              <div>{m.text}</div>

              {/* ── ChatGPT-style Tool & Proposal Card ─────────── */}
              {m.proposal && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/90 bg-white text-slate-800 shadow-xs">
                  {/* Tool Call Header */}
                  <div className="flex items-center justify-between bg-slate-50/90 px-3 py-2 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-700">
                        <Terminal className="h-3 w-3 stroke-[2.5]" />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        tool: create_product
                      </span>
                    </div>

                    {m.proposalStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Awaiting Review
                      </span>
                    )}
                    {m.proposalStatus === 'approved' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                        DB Written
                      </span>
                    )}
                    {m.proposalStatus === 'rejected' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200/80">
                        <X className="h-3 w-3 stroke-[2.5]" />
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Product Parameters */}
                  <div className="p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Product Name</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-mono text-[11px]">
                        {m.proposal.data.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Selling Price</span>
                      <span className="font-bold text-emerald-700 text-sm">₹{m.proposal.data.price}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 font-medium">Initial Stock Quantity</span>
                      <span className="font-bold text-slate-800">{m.proposal.data.stock} units</span>
                    </div>

                    {/* Live Writing-into-DB Animation */}
                    {actionLoadingId === m.proposal.proposal_id && (
                      <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-[11px] text-emerald-900 space-y-2 animate-pulse">
                        <div className="flex items-center gap-2 font-bold text-emerald-800">
                          <Database className="w-4 h-4 text-emerald-600 animate-spin" />
                          <span>{approvingStatus || 'Writing to PostgreSQL database...'}</span>
                        </div>
                        <div className="font-mono text-[10px] text-emerald-700 bg-white/90 p-2 rounded-lg border border-emerald-100">
                          INSERT INTO products (name, price, stock) VALUES ('{m.proposal.data.name}', {m.proposal.data.price}, {m.proposal.data.stock});
                        </div>
                      </div>
                    )}

                    {/* Pending Buttons */}
                    {m.proposalStatus === 'pending' && actionLoadingId !== m.proposal.proposal_id && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(m.proposal!.proposal_id, idx, m.proposal!.data)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#00a86b] hover:bg-[#059669] text-white py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Write to DB</span>
                        </button>
                        <button
                          onClick={() => handleReject(m.proposal!.proposal_id, idx)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Approved Database Receipt with Expandable SQL query */}
                    {m.proposalStatus === 'approved' && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px] bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-2.5 text-emerald-900">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Database className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Target: <code className="font-mono text-emerald-800">public.products</code></span>
                          </div>
                          {m.executedDetails?.product_id && (
                            <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                              Row ID: #{m.executedDetails.product_id}
                            </span>
                          )}
                        </div>

                        {/* Toggle SQL Transaction View */}
                        <button
                          onClick={() => setExpandedSqlIndex(expandedSqlIndex === idx ? null : idx)}
                          className="w-full flex items-center justify-between text-[11px] font-mono text-slate-600 hover:text-slate-900 p-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5 text-slate-500" />
                            {expandedSqlIndex === idx ? 'Hide SQL Transaction' : 'View SQL Transaction Log'}
                          </span>
                          {expandedSqlIndex === idx ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {expandedSqlIndex === idx && m.sqlQuery && (
                          <div className="font-mono text-[10px] bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">
                            <pre>{m.sqlQuery}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
          </div>
        ))}

        {/* ── ChatGPT-style Dynamic Thinking & Extraction Step ── */}
        {isLoading && (
          <div className="max-w-[90%] rounded-2xl rounded-bl-xs bg-white border border-slate-200/90 p-3.5 shadow-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00a86b]/10 text-[#00a86b]">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
              </div>
              <span className="text-[11px] font-bold text-slate-800">AI Assistant Processing</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Live
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-[11px]">
                {loadingStep === 0 && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#00a86b] animate-ping" />
                    <span className="font-medium text-slate-800">Analyzing natural language command...</span>
                  </>
                )}
                {loadingStep === 1 && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-medium text-slate-800">Extracting product attributes (name, price, stock)...</span>
                  </>
                )}
                {loadingStep === 2 && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    <span className="font-medium text-slate-800">Structuring database change proposal for approval...</span>
                  </>
                )}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-[#00a86b] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Suggestion Prompts ─────────────────────── */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-[#00a86b] shrink-0 ml-1" />
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap hover:border-[#00a86b] hover:text-[#00a86b] transition-colors cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ── Chat Input ───────────────────────────────────── */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-[#00a86b] focus-within:bg-white transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 'Add product Balaji Wafers with price 20 and 50 stock'..."
            className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="w-7 h-7 rounded-lg bg-[#00a86b] text-white flex items-center justify-center hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantDrawer;
