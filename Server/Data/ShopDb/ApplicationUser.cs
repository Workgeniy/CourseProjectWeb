using LibraryClasses.Data.ShopDb;
using Microsoft.AspNetCore.Identity;

namespace Server.Data.ShopDb {
    public class ApplicationUser : IdentityUser {
        public Cart Cart { get; set; }
    }
}
