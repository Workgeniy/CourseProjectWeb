using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryClasses.Data.ShopDb
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }

        public ICollection<CartItem> Items { get; set; }

        public string ApplicationUserId { get; set; }
    }
}
