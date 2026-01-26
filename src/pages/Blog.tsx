import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CartDrawer from "@/components/CartDrawer";
import { useState } from "react";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: "1",
    title: "10 xu hướng thiết kế website năm 2024",
    excerpt: "Khám phá những xu hướng thiết kế web mới nhất đang được các thương hiệu lớn áp dụng...",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800",
    category: "Xu hướng",
    author: "Thông Phạm",
    date: "15/01/2024",
  },
  {
    id: "2",
    title: "Hướng dẫn tối ưu tốc độ WordPress",
    excerpt: "Các bước chi tiết để tăng tốc độ website WordPress của bạn lên 90+ điểm PageSpeed...",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    category: "Hướng dẫn",
    author: "Minh Nguyễn",
    date: "12/01/2024",
  },
  {
    id: "3",
    title: "So sánh Elementor vs Gutenberg: Nên chọn cái nào?",
    excerpt: "Phân tích ưu nhược điểm của 2 page builder phổ biến nhất cho WordPress...",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800",
    category: "So sánh",
    author: "Hà Trần",
    date: "10/01/2024",
  },
  {
    id: "4",
    title: "Cách chọn theme WordPress phù hợp cho doanh nghiệp",
    excerpt: "Những tiêu chí quan trọng cần xem xét khi lựa chọn theme cho website doanh nghiệp...",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    category: "Tips",
    author: "Thông Phạm",
    date: "08/01/2024",
  },
  {
    id: "5",
    title: "WooCommerce: Xây dựng cửa hàng online từ A-Z",
    excerpt: "Hướng dẫn đầy đủ từ cài đặt đến vận hành cửa hàng trực tuyến với WooCommerce...",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    category: "E-Commerce",
    author: "Minh Nguyễn",
    date: "05/01/2024",
  },
  {
    id: "6",
    title: "SEO On-page cho WordPress: Checklist đầy đủ",
    excerpt: "Danh sách kiểm tra SEO on-page giúp website của bạn xếp hạng cao trên Google...",
    image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800",
    category: "SEO",
    author: "Hà Trần",
    date: "03/01/2024",
  },
];

const Blog = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Blog & <span className="gradient-text">Tin tức</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Cập nhật xu hướng, tips và hướng dẫn WordPress mới nhất từ đội ngũ ThemeVN.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up">
              <div className="relative rounded-3xl overflow-hidden card-shadow">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="inline-block bg-accent text-accent-foreground text-sm font-medium px-3 py-1 rounded-full mb-4">
                    {blogPosts[0].category}
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-4">{blogPosts[0].title}</h2>
                  <p className="text-white/80 mb-4 max-w-2xl">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {blogPosts[0].author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {blogPosts[0].date}
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post, index) => (
                <AnimatedSection key={post.id} animation="fade-up" delay={index * 100}>
                  <article className="bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all hover:-translate-y-1 group">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                      </div>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection animation="fade-up" className="text-center mt-12">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                Xem tất cả bài viết
                <ArrowRight className="h-4 w-4" />
              </Link>
            </AnimatedSection>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Đăng ký nhận bài viết mới
              </h2>
              <p className="text-muted-foreground mb-8">
                Nhận thông báo khi có bài viết mới về WordPress, SEO và thiết kế web.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 h-12 px-4 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="h-12 px-6 gradient-bg text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Đăng ký
                </button>
              </form>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Blog;
