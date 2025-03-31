using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryClasses.Data.ShopDb
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public double Price { get; set; }
        [Required]
        public int Quantity { get; set; }

        public string? ImagePath { get; set; }

        public int? DescriptionId { get; set; }
        public Description Description { get; set; }

        public int? CategoryId { get; set; }
        public Category Category { get; set; }

        public ICollection<CartItem> CartItems { get; set; }
    }
}
