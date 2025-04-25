using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryClasses.Data.DataDto {
    public class ProductDto {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public int Quantity { get; set; }
        public int? CategoryId { get; set; }
        public int? DescriptionId { get; set; }
        public string? ImagePath { get; set; }
        public string? DescriptionName { get; set; }
        public string? CategoryName { get; set; }
    }
}
