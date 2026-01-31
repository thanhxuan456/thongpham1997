import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import { sendOtpEmail, isEmailConfigured } from "./email";

declare module "express-session" {
  interface SessionData {
    userId: number;
    isAdmin: boolean;
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerRoutes(app: Express): Promise<void> {
  app.get("/api/themes", async (req: Request, res: Response) => {
    try {
      const themes = await storage.getActiveThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch themes" });
    }
  });

  app.get("/api/themes/featured", async (req: Request, res: Response) => {
    try {
      const themes = await storage.getFeaturedThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured themes" });
    }
  });

  app.get("/api/themes/:id", async (req: Request, res: Response) => {
    try {
      const theme = await storage.getTheme(parseInt(req.params.id));
      if (!theme) {
        return res.status(404).json({ error: "Theme not found" });
      }
      res.json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch theme" });
    }
  });

  app.get("/api/menu-items", async (req: Request, res: Response) => {
    try {
      const location = req.query.location as string | undefined;
      const items = await storage.getMenuItems(location);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const allSettings = await storage.getAllSettings();
      const publicSettings = allSettings.filter(s => !s.isSecret);
      res.json(publicSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/coupons/:code", async (req: Request, res: Response) => {
    try {
      const coupon = await storage.getCoupon(req.params.code);
      if (!coupon || !coupon.isActive) {
        return res.status(404).json({ error: "Coupon not found or inactive" });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Coupon has expired" });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ error: "Coupon usage limit reached" });
      }
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify coupon" });
    }
  });

  app.post("/api/subscribers", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      const existing = await storage.getSubscriber(email);
      if (existing) {
        return res.status(400).json({ error: "Email already subscribed" });
      }
      const subscriber = await storage.createSubscriber({ email, name });
      res.json(subscriber);
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.post("/api/auth/send-otp", async (req: Request, res: Response) => {
    try {
      const { email, phone, type } = req.body;
      const target = email || phone;
      
      if (!target) {
        return res.status(400).json({ error: "Email or phone is required" });
      }
      
      const isPhone = phone && !email;
      
      // Check user existence based on type
      const existingUser = isPhone 
        ? await storage.getUserByPhone(phone) 
        : await storage.getUserByEmail(email);
      
      if (type === "login" || type === "recovery") {
        // For login/recovery, user must already be registered
        if (!existingUser) {
          return res.status(400).json({ 
            error: isPhone 
              ? "Số điện thoại chưa được đăng ký" 
              : "Email chưa được đăng ký",
            errorCode: "USER_NOT_FOUND"
          });
        }
      } else if (type === "signup") {
        // For signup, user must NOT exist
        if (existingUser) {
          return res.status(400).json({ 
            error: isPhone 
              ? "Số điện thoại đã được đăng ký" 
              : "Email đã được đăng ký",
            errorCode: "USER_EXISTS"
          });
        }
      }
      
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await storage.createOtp(target, otp, type || "login", expiresAt);
      
      if (isPhone) {
        console.log(`[SMS OTP] Phone: ${phone}, Code: ${otp}`);
        res.json({ 
          success: true, 
          message: "OTP sent via SMS", 
          method: "phone",
          note: "SMS integration required - OTP logged to console for testing"
        });
      } else {
        const emailSent = await sendOtpEmail(email, otp, type || "login");
        if (!emailSent) {
          console.log(`[Email OTP] Email: ${email}, Code: ${otp}`);
        }
        res.json({ 
          success: true, 
          message: emailSent ? "OTP sent via Email" : "OTP generated (check console)",
          method: "email",
          configured: isEmailConfigured()
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { email, phone, code, type, password } = req.body;
      const target = email || phone;
      
      if (!target || !code) {
        return res.status(400).json({ error: "Email/phone and code are required" });
      }
      
      const isValid = await storage.verifyOtp(target, code, type || "login");
      if (!isValid) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
      await storage.markOtpAsUsed(target, code);

      if (type === "signup") {
        if (!password) {
          return res.status(400).json({ error: "Password is required for signup" });
        }
        const existingUser = email ? await storage.getUserByEmail(email) : await storage.getUserByPhone(phone);
        if (existingUser) {
          return res.status(400).json({ error: "Account already registered" });
        }
        const userData = email ? { email, password } : { email: `${phone}@phone.local`, password, phone };
        const user = await storage.createUser(userData);
        req.session.userId = user.id;
        req.session.isAdmin = user.role === "admin";
        return res.json({ success: true, verified: true, user_created: true });
      }

      if (type === "login") {
        const user = email ? await storage.getUserByEmail(email) : await storage.getUserByPhone(phone);
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }
        req.session.userId = user.id;
        req.session.isAdmin = user.role === "admin";
        return res.json({ success: true, verified: true, user });
      }

      res.json({ success: true, verified: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.userId = user.id;
      req.session.isAdmin = user.role === "admin";
      res.json({ success: true, user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.updateUser(user.id, { password: newPassword });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = req.body;
      const order = await storage.createOrder(orderData);
      if (orderData.items) {
        for (const item of orderData.items) {
          await storage.createOrderItem({ ...item, orderId: order.id });
        }
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/support/tickets", async (req: Request, res: Response) => {
    try {
      const ticket = await storage.createSupportTicket(req.body);
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.get("/api/support/tickets/:id", async (req: Request, res: Response) => {
    try {
      const ticket = await storage.getSupportTicket(parseInt(req.params.id));
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      const messages = await storage.getTicketMessages(ticket.id);
      res.json({ ...ticket, messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  app.post("/api/support/tickets/:id/messages", async (req: Request, res: Response) => {
    try {
      const message = await storage.createTicketMessage({
        ...req.body,
        ticketId: parseInt(req.params.id),
      });
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/chat-ratings", async (req: Request, res: Response) => {
    try {
      const rating = await storage.createChatRating(req.body);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit rating" });
    }
  });

  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), req.body);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.get("/api/admin/themes", requireAdmin, async (req: Request, res: Response) => {
    try {
      const themes = await storage.getAllThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch themes" });
    }
  });

  app.post("/api/admin/themes", requireAdmin, async (req: Request, res: Response) => {
    try {
      const theme = await storage.createTheme(req.body);
      res.json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to create theme" });
    }
  });

  app.put("/api/admin/themes/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const theme = await storage.updateTheme(parseInt(req.params.id), req.body);
      res.json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to update theme" });
    }
  });

  app.delete("/api/admin/themes/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteTheme(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete theme" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.put("/api/admin/orders/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const order = await storage.updateOrder(parseInt(req.params.id), req.body);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.get("/api/admin/coupons", requireAdmin, async (req: Request, res: Response) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", requireAdmin, async (req: Request, res: Response) => {
    try {
      const coupon = await storage.createCoupon(req.body);
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });

  app.put("/api/admin/coupons/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const coupon = await storage.updateCoupon(parseInt(req.params.id), req.body);
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteCoupon(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  app.get("/api/admin/settings", requireAdmin, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings/:key", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { value, description, isSecret } = req.body;
      const setting = await storage.upsertSetting(req.params.key, value, description, isSecret);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  app.get("/api/admin/menu-items", requireAdmin, async (req: Request, res: Response) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.post("/api/admin/menu-items", requireAdmin, async (req: Request, res: Response) => {
    try {
      const item = await storage.createMenuItem(req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });

  app.put("/api/admin/menu-items/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const item = await storage.updateMenuItem(parseInt(req.params.id), req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu-items/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteMenuItem(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  });

  app.get("/api/admin/email-templates", requireAdmin, async (req: Request, res: Response) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });

  app.post("/api/admin/email-templates", requireAdmin, async (req: Request, res: Response) => {
    try {
      const template = await storage.createEmailTemplate(req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create email template" });
    }
  });

  app.put("/api/admin/email-templates/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const template = await storage.updateEmailTemplate(parseInt(req.params.id), req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update email template" });
    }
  });

  app.get("/api/admin/subscribers", requireAdmin, async (req: Request, res: Response) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });

  app.delete("/api/admin/subscribers/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteSubscriber(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subscriber" });
    }
  });

  app.get("/api/admin/support/tickets", requireAdmin, async (req: Request, res: Response) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.put("/api/admin/support/tickets/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const ticket = await storage.updateSupportTicket(parseInt(req.params.id), req.body);
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  app.get("/api/admin/chat-ratings", requireAdmin, async (req: Request, res: Response) => {
    try {
      const ratings = await storage.getAllChatRatings();
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });
}
