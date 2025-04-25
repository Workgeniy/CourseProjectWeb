using LibraryClasses.Data.ShopDb;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Server.Data.ShopDb;



namespace Server.Data {
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser> {

        public ApplicationDbContext (DbContextOptions<ApplicationDbContext> options) : base(options) {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Description> Description { get; set; }

        protected override void OnModelCreating (ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Телефоны" },
                new Category { Id = 2, Name = "Телевизоры" },
                new Category { Id = 3, Name = "Холодильники" });

            modelBuilder.Entity<Description>().HasData(
                new Description { Id = 1, Name = "Samsung" },
                new Description { Id = 2, Name = "Toshiba" });

            modelBuilder.Entity<Product>().HasData(
                new Product {
                    Id = 1,
                    Name = "Ноутбук",
                    Quantity = 2,
                    ImagePath = null,
                    Price = 15000,
                    CategoryId = 1,
                    DescriptionId = 1
                });


            modelBuilder.Entity<Cart>()
                .HasOne<ApplicationUser>()
                .WithOne() 
                .HasForeignKey<Cart>(c => c.ApplicationUserId)
                .IsRequired() 
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Cart>()
                .HasIndex(c => c.ApplicationUserId)
                .IsUnique();

        }
    }
}
