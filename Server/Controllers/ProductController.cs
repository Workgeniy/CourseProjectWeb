using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using LibraryClasses.Data.ShopDb;
using System.Text.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using LibraryClasses.Data.DataDto;

namespace Server.Controllers {


    [Route("api/products")]
    [ApiController]
    public class ProductController : ControllerBase {

        private readonly ApplicationDbContext dbContext;
        private readonly string _imageDirectory = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "images");


        public ProductController (ApplicationDbContext dbContext) {
            this.dbContext = dbContext;
            if (!Directory.Exists(_imageDirectory)) {
                Directory.CreateDirectory(_imageDirectory);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts () {

            var products = await dbContext.Products
                .Select(p => new ProductDto {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    DescriptionName = p.Description.Name,
                    CategoryName = p.Category.Name,
                    ImagePath = p.ImagePath
                }).ToListAsync();

            return Ok(products);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddProduct ([FromForm] ProductDto dto, [FromForm] IFormFile? image) {
            Console.WriteLine("\nPRODUCT\n");

            if (image != null) {
                // Генерируем уникальное имя для изображения
                var fileExtension = Path.GetExtension(image.FileName);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(_imageDirectory, fileName);

                // Сохраняем изображение на сервере
                using (var fileStream = new FileStream(filePath, FileMode.Create)) {
                    await image.CopyToAsync(fileStream);
                }

                // Сохраняем путь к изображению в базе данных
                dto.ImagePath = fileName;
            }

            Product product = new Product {
                Id = dto.Id,
                Name = dto.Name,
                Price = dto.Price,
                Quantity = dto.Quantity,
                CategoryId = dto.CategoryId,
                DescriptionId = dto.DescriptionId,
                ImagePath = dto.ImagePath
            };
            Console.WriteLine(product.Name);
            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);

        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteProduct (int id) {

            Product? product = dbContext.Products.Find(id);
            if (product == null) {
                return NotFound();
            }

            // Удаляем изображение с сервера (если оно есть)
            if (!string.IsNullOrEmpty(product.ImagePath)) {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), product.ImagePath);
                if (System.IO.File.Exists(filePath)) {
                    System.IO.File.Delete(filePath);
                }
            }

            dbContext.Products.Remove(product);
            dbContext.SaveChanges();

            return NoContent();
        }
    }
}
