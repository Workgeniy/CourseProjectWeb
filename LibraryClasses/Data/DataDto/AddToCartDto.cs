﻿using LibraryClasses.Data.ShopDb;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryClasses.Data.DataDto {
    public class AddToCartDto {
        public int ProductId { get; set; }
        public int Quantity { get; set; }

    }
}
