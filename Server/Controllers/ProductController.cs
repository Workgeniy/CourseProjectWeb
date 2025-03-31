using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using LibraryClasses.Data.ShopDb;

namespace Server.Controllers {
    [Route("api/products")]
    [ApiController]
    public class ProductController : ControllerBase {

        private readonly ApplicationDbContext dbContext;

        public ProductController (ApplicationDbContext dbContext) {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts () {
            return await dbContext.Products.ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult AddProduct ([FromBody] Product product) {
            if (product == null)
                return BadRequest("Invalid product data");

            product.Id = dbContext.Products.Count() + 1;
            dbContext.Products.Add(product);
            return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
        }


    }
}
