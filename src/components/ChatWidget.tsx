import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Phone, Mail, User, Ticket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_type: "user" | "admin";
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"menu" | "chat" | "tickets" | "create-ticket">("menu");
  const [messages, setMessages] = useState<Message[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form for new ticket
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    if (user?.email) {
      setTicketForm(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchTickets();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (currentTicket) {
      fetchMessages();
      
      // Subscribe to realtime messages
      const channel = supabase
        .channel(`ticket-${currentTicket.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_messages',
            filter: `ticket_id=eq.${currentTicket.id}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTickets = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
  };

  const fetchMessages = async () => {
    if (!currentTicket) return;
    
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", currentTicket.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
      
      // Mark admin messages as read
      await supabase
        .from("ticket_messages")
        .update({ is_read: true })
        .eq("ticket_id", currentTicket.id)
        .eq("sender_type", "admin")
        .eq("is_read", false);
    }
  };

  const createTicket = async () => {
    if (!ticketForm.email || !ticketForm.subject || !ticketForm.message) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user?.id || null,
        user_email: ticketForm.email,
        user_name: ticketForm.name,
        user_phone: ticketForm.phone,
        subject: ticketForm.subject
      })
      .select()
      .single();

    if (error) {
      toast.error("Không thể tạo ticket");
      setLoading(false);
      return;
    }

    // Add first message
    await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      sender_type: "user",
      sender_id: user?.id,
      message: ticketForm.message
    });

    // Create admin notification
    await supabase.from("admin_notifications").insert({
      type: "support",
      title: "Ticket hỗ trợ mới",
      message: `${ticketForm.name || ticketForm.email} đã tạo ticket: ${ticketForm.subject}`,
      ticket_id: ticket.id
    });

    toast.success("Đã gửi yêu cầu hỗ trợ!");
    setTicketForm({ name: "", email: user?.email || "", phone: "", subject: "", message: "" });
    setCurrentTicket(ticket);
    setView("chat");
    await fetchMessages();
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTicket) return;

    setLoading(true);
    
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: currentTicket.id,
      sender_type: "user",
      sender_id: user?.id,
      message: newMessage.trim()
    });

    if (!error) {
      setNewMessage("");
      
      // Notify admin
      await supabase.from("admin_notifications").insert({
        type: "message",
        title: "Tin nhắn mới",
        message: `Tin nhắn mới từ ticket: ${currentTicket.subject}`,
        ticket_id: currentTicket.id
      });
    }
    
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 gradient-bg rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center group hover:scale-110 transition-transform"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="gradient-bg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view !== "menu" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-white/20 -ml-2"
                  onClick={() => {
                    if (view === "chat") {
                      setCurrentTicket(null);
                      setMessages([]);
                      setView("tickets");
                    } else {
                      setView("menu");
                    }
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h3 className="font-semibold text-primary-foreground">Hỗ trợ trực tuyến</h3>
                <p className="text-xs text-primary-foreground/80">
                  {view === "menu" && "Chúng tôi sẵn sàng hỗ trợ bạn"}
                  {view === "tickets" && "Danh sách ticket"}
                  {view === "chat" && currentTicket?.subject}
                  {view === "create-ticket" && "Tạo yêu cầu mới"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="h-96 overflow-y-auto">
            {/* Menu View */}
            {view === "menu" && (
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setView("create-ticket")}
                  className="w-full p-4 bg-secondary/50 hover:bg-secondary rounded-xl flex items-center gap-4 transition-colors"
                >
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Chat trực tiếp</p>
                    <p className="text-sm text-muted-foreground">Bắt đầu cuộc trò chuyện mới</p>
                  </div>
                </button>

                {user && (
                  <button
                    onClick={() => setView("tickets")}
                    className="w-full p-4 bg-secondary/50 hover:bg-secondary rounded-xl flex items-center gap-4 transition-colors"
                  >
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Ticket của tôi</p>
                      <p className="text-sm text-muted-foreground">{tickets.length} ticket</p>
                    </div>
                  </button>
                )}

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Liên hệ khác</p>
                  <div className="space-y-2">
                    <a
                      href="mailto:support@themevn.com"
                      className="flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="text-sm text-foreground">support@themevn.com</span>
                    </a>
                    <a
                      href="tel:+84123456789"
                      className="flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Phone className="h-5 w-5 text-primary" />
                      <span className="text-sm text-foreground">+84 123 456 789</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets List */}
            {view === "tickets" && (
              <div className="p-4 space-y-2">
                {tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Chưa có ticket nào</p>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="mt-4"
                      onClick={() => setView("create-ticket")}
                    >
                      Tạo ticket mới
                    </Button>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => {
                        setCurrentTicket(ticket);
                        setView("chat");
                      }}
                      className="w-full p-3 bg-secondary/50 hover:bg-secondary rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground line-clamp-1">{ticket.subject}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ticket.status === "open" ? "bg-green-500/20 text-green-600" :
                          ticket.status === "pending" ? "bg-yellow-500/20 text-yellow-600" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {ticket.status === "open" ? "Đang mở" : 
                           ticket.status === "pending" ? "Chờ xử lý" : "Đã đóng"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ticket.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Create Ticket Form */}
            {view === "create-ticket" && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Họ tên</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nhập họ tên"
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Số điện thoại</label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="0123 456 789"
                      value={ticketForm.phone}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Chủ đề *</label>
                  <Input
                    placeholder="Tiêu đề yêu cầu hỗ trợ"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Nội dung *</label>
                  <Textarea
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={createTicket}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Gửi yêu cầu
                </Button>
              </div>
            )}

            {/* Chat View */}
            {view === "chat" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.sender_type === "user"
                            ? "gradient-bg text-primary-foreground rounded-br-md"
                            : "bg-secondary text-foreground rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString("vi-VN", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          {view === "chat" && currentTicket?.status !== "closed" && (
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  variant="gradient"
                  size="icon"
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
