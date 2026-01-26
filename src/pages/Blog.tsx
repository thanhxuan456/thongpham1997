import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CartDrawer from "@/components/CartDrawer";
import { useState } from "react";
import { Calendar, User, ArrowRight, Tag, Clock, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: "1",
    title: "10 xu hướng thiết kế website năm 2024",
    excerpt: "Khám phá những xu hướng thiết kế web mới nhất đang được các thương hiệu lớn áp dụng trong năm nay.",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800",
    category: "Xu hướng",
    author: "Thông Phạm",
    date: "15/01/2024",
    readTime: "5 phút",
  },
  {
    id: "2",
    title: "Hướng dẫn tối ưu tốc độ WordPress",
    excerpt: "Các bước chi tiết để tăng tốc độ website WordPress của bạn lên 90+ điểm PageSpeed Insights.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    category: "Hướng dẫn",
    author: "Minh Nguyễn",
    date: "12/01/2024",
    readTime: "8 phút",
  },
  {
    id: "3",
    title: "So sánh Elementor vs Gutenberg: Nên chọn cái nào?",
    excerpt: "Phân tích ưu nhược điểm của 2 page builder phổ biến nhất cho WordPress hiện nay.",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800",
    category: "So sánh",
    author: "Hà Trần",
    date: "10/01/2024",
    readTime: "6 phút",
  },
  {
    id: "4",
    title: "Cách chọn theme WordPress phù hợp cho doanh nghiệp",
    excerpt: "Những tiêu chí quan trọng cần xem xét khi lựa chọn theme cho website doanh nghiệp.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    category: "Tips",
    author: "Thông Phạm",
    date: "08/01/2024",
    readTime: "4 phút",
  },
  {
    id: "5",
    title: "WooCommerce: Xây dựng cửa hàng online từ A-Z",
    excerpt: "Hướng dẫn đầy đủ từ cài đặt đến vận hành cửa hàng trực tuyến với WooCommerce.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    category: "E-Commerce",
    author: "Minh Nguyễn",
    date: "05/01/2024",
    readTime: "12 phút",
  },
  {
    id: "6",
    title: "SEO On-page cho WordPress: Checklist đầy đủ",
    excerpt: "Danh sách kiểm tra SEO on-page giúp website của bạn xếp hạng cao trên Google.",
    image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800",
    category: "SEO",
    author: "Hà Trần",
    date: "03/01/2024",
    readTime: "7 phút",
  },
];

const categories = ["Tất cả", "Xu hướng", "Hướng dẫn", "So sánh", "Tips", "E-Commerce", "SEO"];

const Blog = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredPosts = selectedCategory === "Tất cả" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute top-10 right-[15%] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-[10%] w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <BookOpen className="h-4 w-4" />
                Blog & Tin tức
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Kiến thức <span className="gradient-text">WordPress</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Cập nhật xu hướng, tips và hướng dẫn WordPress mới nhất từ đội ngũ ThemeVN.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur-lg z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "gradient-bg text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up">
              <div className="relative rounded-3xl overflow-hidden card-shadow group">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full">
                      <TrendingUp className="h-4 w-4" />
                      Bài viết nổi bật
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                      {blogPosts[0].category}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-white/80 mb-6 max-w-2xl text-lg">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-white/70">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      {blogPosts[0].author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {blogPosts[0].date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {blogPosts[0].readTime}
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
            <AnimatedSection animation="fade-up" className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedCategory === "Tất cả" ? "Tất cả bài viết" : `Danh mục: ${selectedCategory}`}
                <span className="text-muted-foreground font-normal ml-2">({filteredPosts.length})</span>
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post, index) => (
                <AnimatedSection key={post.id} animation="fade-up" delay={index * 100}>
                  <article className="bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all hover:-translate-y-2 group border border-border/50">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-full border border-border/50">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          {post.author}
                        </span>
                        <Link
                          to="#"
                          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Đọc tiếp
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>

            {/* Load more */}
            <AnimatedSection animation="fade-up" className="text-center mt-12">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-xl transition-colors">
                Xem thêm bài viết
                <ArrowRight className="h-4 w-4" />
              </button>
            </AnimatedSection>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 border border-white/20 rounded-full" />
                <div className="absolute bottom-0 left-0 w-60 h-60 border border-white/20 rounded-full" />
              </div>

              <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto text-center relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                  ✉️ Newsletter
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Đăng ký nhận bài viết mới
                </h2>
                <p className="text-white/80 mb-8 text-lg">
                  Nhận thông báo khi có bài viết mới về WordPress, SEO và thiết kế web.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="flex-1 h-14 px-5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="submit"
                    className="h-14 px-8 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                  >
                    Đăng ký
                  </button>
                </form>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Blog;
