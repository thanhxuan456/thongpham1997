import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const INSTALL_LOCK_FILE = path.join(process.cwd(), ".installed");

export function isInstalled(): boolean {
  return fs.existsSync(INSTALL_LOCK_FILE);
}

export function markAsInstalled(): void {
  fs.writeFileSync(INSTALL_LOCK_FILE, new Date().toISOString());
}

function sanitizeIdentifier(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "");
}

function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_]{0,62}$/.test(name);
}

export function registerInstallerRoutes(app: Express): void {
  app.get("/api/install/status", async (req: Request, res: Response) => {
    try {
      const installed = isInstalled();
      const hasDatabase = !!process.env.DATABASE_URL;
      
      res.json({
        installed,
        hasDatabase,
        dbType: process.env.DB_TYPE || "postgresql",
        step: installed ? "complete" : hasDatabase ? "admin" : "database"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check installation status" });
    }
  });

  app.post("/api/install/test-database", async (req: Request, res: Response) => {
    if (isInstalled()) {
      return res.status(400).json({ error: "Already installed" });
    }

    try {
      const { dbType, host, port, database, username, password } = req.body;
      
      if (!dbType || !host || !database || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let connectionUrl: string;
      if (dbType === "mysql") {
        connectionUrl = `mysql://${username}:${password || ""}@${host}:${port || 3306}/${database}`;
      } else {
        connectionUrl = `postgresql://${username}:${password || ""}@${host}:${port || 5432}/${database}`;
      }

      if (dbType === "mysql") {
        const mysql = await import("mysql2/promise");
        const connection = await mysql.createConnection(connectionUrl);
        await connection.execute("SELECT 1");
        await connection.end();
      } else {
        const pg = await import("pg");
        const client = new pg.default.Client({ connectionString: connectionUrl });
        await client.connect();
        await client.query("SELECT 1");
        await client.end();
      }

      res.json({ 
        success: true, 
        message: "Kết nối cơ sở dữ liệu thành công!",
        connectionUrl 
      });
    } catch (error: any) {
      console.error("Database test error:", error);
      res.status(400).json({ 
        success: false,
        error: "Không thể kết nối đến cơ sở dữ liệu",
        details: error.message 
      });
    }
  });

  app.post("/api/install/create-database", async (req: Request, res: Response) => {
    if (isInstalled()) {
      return res.status(400).json({ error: "Already installed" });
    }

    try {
      const { dbType, host, port, database, username, password, rootPassword } = req.body;
      
      if (!dbType || !host || !database || !username || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const safeDatabase = sanitizeIdentifier(database);
      const safeUsername = sanitizeIdentifier(username);
      
      if (!isValidIdentifier(safeDatabase)) {
        return res.status(400).json({ error: "Tên database không hợp lệ (chỉ chữ cái, số và gạch dưới)" });
      }
      
      if (!isValidIdentifier(safeUsername)) {
        return res.status(400).json({ error: "Tên user không hợp lệ (chỉ chữ cái, số và gạch dưới)" });
      }

      if (dbType === "mysql") {
        const mysql = await import("mysql2/promise");
        const rootConnection = await mysql.createConnection({
          host,
          port: port || 3306,
          user: "root",
          password: rootPassword || ""
        });

        await rootConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${safeDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await rootConnection.execute(`CREATE USER IF NOT EXISTS ?@'%' IDENTIFIED BY ?`, [safeUsername, password]);
        await rootConnection.execute(`GRANT ALL PRIVILEGES ON \`${safeDatabase}\`.* TO ?@'%'`, [safeUsername]);
        await rootConnection.execute(`FLUSH PRIVILEGES`);
        await rootConnection.end();

      } else {
        const pg = await import("pg");
        const rootClient = new pg.default.Client({
          host,
          port: port || 5432,
          user: "postgres",
          password: rootPassword || "",
          database: "postgres"
        });
        
        await rootClient.connect();
        
        const userExists = await rootClient.query(
          "SELECT 1 FROM pg_roles WHERE rolname = $1",
          [safeUsername]
        );
        
        if (userExists.rows.length === 0) {
          await rootClient.query(`CREATE USER "${safeUsername}" WITH PASSWORD $1`, [password]);
        } else {
          await rootClient.query(`ALTER USER "${safeUsername}" WITH PASSWORD $1`, [password]);
        }
        
        const dbExists = await rootClient.query(
          "SELECT 1 FROM pg_database WHERE datname = $1",
          [safeDatabase]
        );
        
        if (dbExists.rows.length === 0) {
          await rootClient.query(`CREATE DATABASE "${safeDatabase}" OWNER "${safeUsername}"`);
        }
        
        await rootClient.query(`GRANT ALL PRIVILEGES ON DATABASE "${safeDatabase}" TO "${safeUsername}"`);
        await rootClient.end();
      }

      let connectionUrl: string;
      if (dbType === "mysql") {
        connectionUrl = `mysql://${username}:${password}@${host}:${port || 3306}/${database}`;
      } else {
        connectionUrl = `postgresql://${username}:${password}@${host}:${port || 5432}/${database}`;
      }

      res.json({ 
        success: true, 
        message: "Đã tạo cơ sở dữ liệu thành công!",
        connectionUrl
      });
    } catch (error: any) {
      console.error("Create database error:", error);
      res.status(400).json({ 
        success: false,
        error: "Không thể tạo cơ sở dữ liệu",
        details: error.message 
      });
    }
  });

  app.post("/api/install/setup-tables", async (req: Request, res: Response) => {
    if (isInstalled()) {
      return res.status(400).json({ error: "Already installed" });
    }

    try {
      const { storage } = await import("./storage");
      
      const testSettings = await storage.getAllSettings().catch(() => null);
      
      if (testSettings !== null) {
        res.json({ 
          success: true, 
          message: "Cấu trúc bảng đã sẵn sàng!" 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: "Vui lòng chạy 'npm run db:push' để tạo bảng" 
        });
      }
    } catch (error: any) {
      console.error("Setup tables error:", error);
      res.status(400).json({ 
        success: false,
        error: "Không thể kiểm tra cấu trúc bảng",
        details: error.message 
      });
    }
  });

  app.post("/api/install/create-admin", async (req: Request, res: Response) => {
    if (isInstalled()) {
      return res.status(400).json({ error: "Already installed" });
    }

    try {
      const { email, password, fullName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
      }

      const { storage } = await import("./storage");
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        await storage.updateUser(existingUser.id, { 
          role: "admin",
          password: await bcrypt.hash(password, 10)
        });
        
        return res.json({ 
          success: true, 
          message: "Đã cập nhật tài khoản admin!",
          userId: existingUser.id
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName: fullName || "Administrator",
        role: "admin",
        isActive: true
      });

      res.json({ 
        success: true, 
        message: "Đã tạo tài khoản admin thành công!",
        userId: user.id
      });
    } catch (error: any) {
      console.error("Create admin error:", error);
      res.status(400).json({ 
        success: false,
        error: "Không thể tạo tài khoản admin",
        details: error.message 
      });
    }
  });

  app.post("/api/install/configure-site", async (req: Request, res: Response) => {
    if (isInstalled()) {
      return res.status(400).json({ error: "Already installed" });
    }

    try {
      const { siteName, siteUrl, smtpHost, smtpPort, smtpUser, smtpPass } = req.body;
      
      const { storage } = await import("./storage");
      
      if (siteName) {
        await storage.upsertSetting("site_name", siteName, "Site name");
      }
      if (siteUrl) {
        await storage.upsertSetting("site_url", siteUrl, "Site URL");
      }
      if (smtpHost) {
        await storage.upsertSetting("smtp_host", smtpHost, "SMTP host", true);
      }
      if (smtpPort) {
        await storage.upsertSetting("smtp_port", smtpPort.toString(), "SMTP port", true);
      }
      if (smtpUser) {
        await storage.upsertSetting("smtp_user", smtpUser, "SMTP username", true);
      }
      if (smtpPass) {
        await storage.upsertSetting("smtp_pass", smtpPass, "SMTP password", true);
      }

      res.json({ 
        success: true, 
        message: "Đã lưu cấu hình trang web!" 
      });
    } catch (error: any) {
      console.error("Configure site error:", error);
      res.status(400).json({ 
        success: false,
        error: "Không thể lưu cấu hình",
        details: error.message 
      });
    }
  });

  app.post("/api/install/complete", async (req: Request, res: Response) => {
    if (isInstalled()) {
      return res.status(400).json({ error: "Already installed" });
    }

    try {
      markAsInstalled();
      
      res.json({ 
        success: true, 
        message: "Cài đặt hoàn tất! Chào mừng đến với ThemeVN." 
      });
    } catch (error: any) {
      console.error("Complete installation error:", error);
      res.status(500).json({ 
        success: false,
        error: "Không thể hoàn tất cài đặt",
        details: error.message 
      });
    }
  });
}
