import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, Loader2, Bell, Check, CheckCheck, Phone, Mail, User, Search, Filter, Archive, Download, Trash2, MoreVertical, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Ticket {
  id: string;
  user_email: string;
  user_name: string | null;
  user_phone: string | null;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  sender_type: "user" | "admin";
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  ticket_id: string | null;
}

const AdminSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [archivedTickets, setArchivedTickets] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies] = useState([
    "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ hỗ trợ bạn ngay!",
    "Vui lòng cung cấp thêm thông tin để chúng tôi hỗ trợ tốt hơn.",
    "Vấn đề của bạn đã được ghi nhận. Chúng tôi đang xử lý.",
    "Cảm ơn bạn đã phản hồi. Chúc bạn một ngày tốt lành!"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJarrK2pnaRzTD1PbY2tr7GnmnxVLjBQeoiTlo+DeF1LSEI+OUA/Q0NCTFJXV1VYYGlrcnZ5fH19fYB+fHZ4e359fHp4dnNub2tnaWhjWFRNSUQ8Ny8rIyQlJigtNDpCS1NbYGZrcnd9gYKCgoKEhoWDgH55dnZ2d3h3dXNxb21qZmZkY2BeXVtZWFlbXF1hZGdqbnFzdnl7fHx9fX19fX18e3h2dHFtamRgWlVNRDw4MS0pJSEeHR0eHyMlKS4zOD5ES09UWVxfYWNkZWZnaGhpaWloaGhoaWlpamprbG1ubm5ub25ubWxramhkYV5cWlhWVFJQTk1LSUdGRURDQ0JBQEFBQkNERUdISktNT1FTVVhbXmFkZmlsbnFzdnl7fX5/gIGBgYGBgYGAf399fHp5eHZ1c3FvbWtqaGdmZWRjYmJhYGBgYGBhYWFiYmNjZGVmaGlrbG5vcXN0dnd4eXp7fH1+fn5/f39/f39+fn59fHt6eXh3dXRycXBvbm1sbGtramppamlobWxtbm9xcXJzc3R0dHR0c3NycnFwb25tbGtpaWhnZmVkY2JhYF9fXl1dXFxcXFxcXFxdXV5eX2BhYWJjZGVmZ2hpamttbm9wcnN0dXZ3eHl5ent7fHx9fX19fX19fX19fXx8fHt7enp5eXh4d3d2dnV1dHRzc3NycnJycnJycnNzc3R0dHV1dXZ2d3d4eHl5enp7e3x8fHx9fX19fX19fX19fHx8e3t7enp5eXl4eHd3d3Z2dnV1dHR0c3NzcnJycnJycnJycnJyc3Nzc3R0dHV1dXZ2dnZ3d3d4eHh4eXl5enp6enp7e3t7e3t8fHx8fHx8fHx8fHx7e3t7e3t6enp6enl5eXl5eHh4eHh3d3d3d3d3d3d3d3d4eHh4eHh4eXl5eXl5enp6enp6e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3s=");
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  useEffect(() => {
    fetchTickets();
    fetchNotifications();
    loadArchivedTickets();

    // Subscribe to realtime tickets
    const ticketChannel = supabase
      .channel("admin-tickets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, (payload) => {
        if (payload.eventType === "INSERT") {
          playNotificationSound();
          toast.info("Ticket mới!", { description: (payload.new as Ticket).subject });
        }
        fetchTickets();
      })
      .subscribe();

    // Subscribe to realtime notifications
    const notifChannel = supabase
      .channel("admin-notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, (payload) => {
        playNotificationSound();
        setNotifications(prev => [payload.new as Notification, ...prev]);
        toast.info("Thông báo mới", { description: (payload.new as Notification).title });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [playNotificationSound]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages();

      // Subscribe to realtime messages for selected ticket
      const channel = supabase
        .channel(`admin-chat-${selectedTicket.id}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${selectedTicket.id}`
        }, (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          // Play sound for user messages
          if (newMsg.sender_type === "user") {
            playNotificationSound();
            // Show typing indicator briefly
            setIsTyping(false);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket, playNotificationSound]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadArchivedTickets = () => {
    const archived = localStorage.getItem("archivedTickets");
    if (archived) {
      setArchivedTickets(JSON.parse(archived));
    }
  };

  const saveArchivedTickets = (archived: string[]) => {
    localStorage.setItem("archivedTickets", JSON.stringify(archived));
    setArchivedTickets(archived);
  };

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
  };

  const fetchMessages = async () => {
    if (!selectedTicket) return;

    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", selectedTicket.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);

      // Mark user messages as read
      await supabase
        .from("ticket_messages")
        .update({ is_read: true })
        .eq("ticket_id", selectedTicket.id)
        .eq("sender_type", "user")
        .eq("is_read", false);
    }
  };

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setLoading(true);

    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: selectedTicket.id,
      sender_type: "admin",
      sender_id: user?.id,
      message: newMessage.trim()
    });

    if (!error) {
      const messageSent = newMessage.trim();
      setNewMessage("");
      
      // Update ticket status to pending if it was open
      if (selectedTicket.status === "open") {
        await updateTicketStatus("pending");
      }
      
      // Send email notification to customer
      try {
        await supabase.functions.invoke("send-ticket-reply-email", {
          body: { 
            ticketId: selectedTicket.id,
            message: messageSent
          }
        });
        toast.success("Đã gửi email thông báo cho khách hàng");
      } catch (emailError) {
        console.log("Could not send email notification:", emailError);
      }
    }

    setLoading(false);
  };

  const updateTicketStatus = async (status: string) => {
    if (!selectedTicket) return;

    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", selectedTicket.id);

    if (!error) {
      setSelectedTicket(prev => prev ? { ...prev, status } : null);
      fetchTickets();
      toast.success(`Đã cập nhật trạng thái: ${status}`);
    }
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const archiveTicket = (ticketId: string) => {
    const newArchived = [...archivedTickets, ticketId];
    saveArchivedTickets(newArchived);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    toast.success("Đã lưu trữ ticket");
  };

  const unarchiveTicket = (ticketId: string) => {
    const newArchived = archivedTickets.filter(id => id !== ticketId);
    saveArchivedTickets(newArchived);
    toast.success("Đã khôi phục ticket");
  };

  const downloadChatHistory = async (ticket: Ticket) => {
    const { data: chatMessages } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });

    if (!chatMessages || chatMessages.length === 0) {
      toast.error("Không có tin nhắn để tải");
      return;
    }

    const content = [
      `===== LỊCH SỬ CHAT =====`,
      `Ticket: ${ticket.subject}`,
      `Khách hàng: ${ticket.user_name || ticket.user_email}`,
      `Email: ${ticket.user_email}`,
      `Điện thoại: ${ticket.user_phone || "N/A"}`,
      `Trạng thái: ${ticket.status}`,
      `Ngày tạo: ${format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}`,
      ``,
      `===== TIN NHẮN =====`,
      ...chatMessages.map(msg => {
        const sender = msg.sender_type === "admin" ? "Admin" : (ticket.user_name || "Khách");
        const time = format(new Date(msg.created_at), "dd/MM/yyyy HH:mm:ss", { locale: vi });
        return `[${time}] ${sender}: ${msg.message}`;
      })
    ].join("\n");

    const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chat_${ticket.id.slice(0, 8)}_${format(new Date(), "yyyyMMdd")}.txt`;
    link.click();

    toast.success("Đã tải lịch sử chat");
  };

  const deleteTicket = async (ticketId: string) => {
    // First delete all messages
    await supabase.from("ticket_messages").delete().eq("ticket_id", ticketId);
    
    // Delete notifications related to this ticket
    await supabase.from("admin_notifications").delete().eq("ticket_id", ticketId);
    
    // Delete the ticket
    const { error } = await supabase.from("support_tickets").delete().eq("id", ticketId);
    
    if (error) {
      toast.error("Không thể xóa ticket");
    } else {
      // Remove from archived if exists
      const newArchived = archivedTickets.filter(id => id !== ticketId);
      saveArchivedTickets(newArchived);
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
      fetchTickets();
      toast.success("Đã xóa ticket");
    }
    
    setDeleteDialogOpen(false);
    setTicketToDelete(null);
  };

  const activeTickets = tickets.filter(t => !archivedTickets.includes(t.id));
  const archivedTicketsList = tickets.filter(t => archivedTickets.includes(t.id));

  const filteredTickets = (activeTab === "active" ? activeTickets : archivedTicketsList).filter(ticket => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.user_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hỗ trợ khách hàng</h1>
            <p className="text-muted-foreground">Quản lý tickets và chat trực tiếp với khách hàng</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="gap-2"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {soundEnabled ? "Bật âm" : "Tắt âm"}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchTickets} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
            <Badge variant={unreadNotifications > 0 ? "destructive" : "secondary"} className="animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              {unreadNotifications} thông báo mới
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Danh sách Tickets</CardTitle>
                <Badge variant="outline">
                  {activeTab === "active" ? activeTickets.length : archivedTicketsList.length}
                </Badge>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Đang hoạt động
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="gap-2">
                    <Archive className="h-4 w-4" />
                    Lưu trữ
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="open">Mới</SelectItem>
                    <SelectItem value="pending">Đang xử lý</SelectItem>
                    <SelectItem value="closed">Đã đóng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="max-h-[550px] overflow-y-auto">
              <div className="space-y-2">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Không có ticket nào</p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-lg transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? "bg-primary/10 border border-primary"
                          : "bg-secondary/50 hover:bg-secondary border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="flex-1 text-left min-w-0"
                        >
                          <p className="font-medium text-foreground truncate">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">{ticket.user_email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </p>
                        </button>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge
                            variant={
                              ticket.status === "open" ? "default" :
                              ticket.status === "pending" ? "secondary" : "outline"
                            }
                            className="shrink-0"
                          >
                            {ticket.status === "open" ? "Mới" :
                             ticket.status === "pending" ? "Đang xử lý" : "Đã đóng"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => downloadChatHistory(ticket)}>
                                <Download className="h-4 w-4 mr-2" />
                                Tải lịch sử chat
                              </DropdownMenuItem>
                              {activeTab === "active" ? (
                                <DropdownMenuItem onClick={() => archiveTicket(ticket.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Lưu trữ
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => unarchiveTicket(ticket.id)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Khôi phục
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setTicketToDelete(ticket.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa vĩnh viễn
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedTicket ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {selectedTicket.user_name || "Khách"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedTicket.user_email}
                        </span>
                        {selectedTicket.user_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedTicket.user_phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadChatHistory(selectedTicket)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Tải
                      </Button>
                      <Select value={selectedTicket.status} onValueChange={updateTicketStatus}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Mới</SelectItem>
                          <SelectItem value="pending">Đang xử lý</SelectItem>
                          <SelectItem value="closed">Đã đóng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Messages */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            msg.sender_type === "admin"
                              ? "gradient-bg text-primary-foreground rounded-br-md"
                              : "bg-secondary text-foreground rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            msg.sender_type === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            <span>
                              {format(new Date(msg.created_at), "HH:mm", { locale: vi })}
                            </span>
                            {msg.sender_type === "admin" && (
                              msg.is_read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input with quick replies */}
                  {selectedTicket.status !== "closed" && (
                    <div className="p-4 border-t space-y-3">
                      {/* Quick Replies */}
                      <div className="flex gap-2 flex-wrap">
                        {quickReplies.map((reply, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setNewMessage(reply)}
                          >
                            {reply.slice(0, 25)}...
                          </Button>
                        ))}
                      </div>
                      
                      {/* Message Input */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Nhập tin nhắn trả lời khách hàng... (Enter để gửi, Shift+Enter để xuống dòng)"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                          rows={2}
                        />
                        <Button
                          variant="gradient"
                          onClick={sendMessage}
                          disabled={loading || !newMessage.trim()}
                          className="self-end"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💡 Tin nhắn sẽ gửi email thông báo cho khách hàng tự động
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chọn một ticket để bắt đầu chat với khách hàng</p>
                  <p className="text-xs text-muted-foreground mt-2">Tin nhắn mới sẽ hiển thị real-time 🔔</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Notifications Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Thông báo gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.ticket_id) {
                      const ticket = tickets.find(t => t.id === notif.ticket_id);
                      if (ticket) setSelectedTicket(ticket);
                    }
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notif.is_read ? "bg-secondary/30" : "bg-primary/10 border border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notif.created_at), "HH:mm", { locale: vi })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa ticket</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa ticket này? Tất cả tin nhắn và dữ liệu liên quan sẽ bị xóa vĩnh viễn.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => ticketToDelete && deleteTicket(ticketToDelete)}
              >
                Xóa vĩnh viễn
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
